#####
##### validation
#####

# manually unrolling the accesses here seems to enable better constant propagation
@inline function _validate_annotation_fields(names, types)
    names[1] === :recording || throw(ArgumentError("invalid `Annotation` fields: field 1 must be named `:recording`, got $(names[1])"))
    names[2] === :id || throw(ArgumentError("invalid `Annotation` fields: field 2 must be named `:id`, got $(names[2])"))
    names[3] === :span || throw(ArgumentError("invalid `Annotation` fields: field 3 must be named `:span`, got $(names[3])"))
    types[1] <: Union{UInt128,UUID} || throw(ArgumentError("invalid `Annotation` fields: invalid `:recording` field type: $(types[1])"))
    types[2] <: Union{UInt128,UUID} || throw(ArgumentError("invalid `Annotation` fields: invalid `:id` field type: $(types[2])"))
    types[3] <: Union{NamedTupleTimeSpan,TimeSpan} || throw(ArgumentError("invalid `Annotation` fields: invalid `:span` field type: $(types[3])"))
    return nothing
end

@inline _validate_annotation_field_count(n) = n >= 3 || throw(ArgumentError("invalid `Annotation` fields: need at least 3 fields, input has $n"))

function validate_annotation_row(row)
    names = Tables.columnnames(row)
    _validate_annotation_field_count(length(names))
    types = (typeof(Tables.getcolumn(row, 1)), typeof(Tables.getcolumn(row, 2)), typeof(Tables.getcolumn(row, 3)))
    _validate_annotation_fields(names, types)
    return nothing
end

validate_annotation_schema(::Nothing) = @warn "`schema == nothing`; skipping schema validation"

function validate_annotation_schema(schema::Tables.Schema)
    _validate_annotation_field_count(length(schema.names))
    _validate_annotation_fields(schema.names, schema.types)
    return nothing
end

#####
##### Annotation
#####

"""
    Annotation(annotations_table_row)
    Annotation(recording, id, span; custom...)
    Annotation(; recording, id, span, custom...)

Return an `Annotation` instance that represents a row of an `*.onda.annotations.arrow` table.

This type primarily exists to aid in the validated construction of such rows/tables,
and is not intended to be used as a type constraint in function or struct definitions.
Instead, you should generally duck-type any "annotation-like" arguments/fields so that
other generic row types will compose with your code.

This type supports Tables.jl's `AbstractRow` interface (but does not subtype `AbstractRow`).
"""
struct Annotation{R}
    _row::R
    function Annotation(_row::R) where {R}
        validate_annotation_row(_row)
        return new{R}(_row)
    end
    function Annotation(recording, id, span; custom...)
        recording = recording isa UUID ? recording : UUID(recording)
        id = id isa UUID ? id : UUID(id)
        _row = (; recording, id, span=TimeSpan(span), custom...)
        return new{typeof(_row)}(_row)
    end
end

Annotation(; recording, id, span, custom...) = Annotation(recording, id, span; custom...)

Base.propertynames(x::Annotation) = propertynames(getfield(x, :_row))
Base.getproperty(x::Annotation, name::Symbol) = getproperty(getfield(x, :_row), name)

ConstructionBase.setproperties(x::Annotation, patch::NamedTuple) = Annotation(setproperties(getfield(x, :_row), patch))

Tables.getcolumn(x::Annotation, i::Int) = Tables.getcolumn(getfield(x, :_row), i)
Tables.getcolumn(x::Annotation, nm::Symbol) = Tables.getcolumn(getfield(x, :_row), nm)
Tables.columnnames(x::Annotation) = Tables.columnnames(getfield(x, :_row))

#####
##### read/write
#####

"""
    read_annotations(io_or_path; materialize::Bool=false, validate_schema::Bool=true)

Return the `*.onda.annotations.arrow`-compliant table read from `io_or_path`.

If `validate_schema` is `true`, the table's schema will be validated to ensure it is
a `*.onda.annotations.arrow`-compliant table. An `ArgumentError` will be thrown if
any schema violation is detected.

If `materialize` is `false`, the returned table will be an `Arrow.Table` while if
`materialize` is `true`, the returned table will be a `NamedTuple` of columns. The
primary difference is that the former has a conversion-on-access behavior, while
for the latter, any potential conversion cost has been paid up front.
"""
function read_annotations(io_or_path; materialize::Bool=false, validate_schema::Bool=true)
    table = read_onda_table(io_or_path; materialize)
    validate_schema && validate_annotation_schema(Tables.schema(table))
    return table
end

"""
    write_annotations(io_or_path, table; kwargs...)

Write `table` to `io_or_path`, first validating that `table` is a
`*.onda.annotations.arrow`-compliant table. An `ArgumentError` will
be thrown if any schema violation is detected.

`kwargs` is forwarded to an internal invocation of `Arrow.write(...; file=true, kwargs...)`.
"""
function write_annotations(io_or_path, table; kwargs...)
    columns = Tables.columns(table)
    schema = Tables.schema(columns)
    try
        validate_annotation_schema(schema)
    catch
        @warn "Invalid schema in input `table`. Try calling `Annotation.(Tables.rows(table))` to see if it is convertible to the required schema."
        rethrow()
    end
    return write_onda_table(io_or_path, columns; kwargs...)
end

#####
##### utilities
#####

"""
    merge_overlapping_annotations(annotations)

Given the `*.onda.annotations.arrow`-compliant table `annotations`, return
a table corresponding to `annotations` except that overlapping entries have
been merged.

Specifically, two annotations `a` and `b` are determined to be "overlapping"
if `a.recording == b.recording && TimeSpans.overlaps(a.span, b.span)`. Merged
annotations' `span` fields are generated via calling `TimeSpans.shortest_timespan_containing`
on the overlapping set of source annotations.

The returned annotations table only has a single custom column named `from`
whose entries are `Vector{UUID}`s populated with the `id`s of the generated
annotations' source(s). Note that every annotation in the returned table
has a freshly generated `id` field and a non-empty `from` field, even if
the `from` only has a single element (i.e. corresponds to a single
non-overlapping annotation).
"""
function merge_overlapping_annotations(annotations)
    columns = Tables.columns(annotations)
    merged = Annotation[]
    for (rid, (locs,)) in Onda.locations((columns.recording,))
        subset = (recording=view(columns.recording, locs), id=view(columns.id, locs), span=view(columns.span, locs))
        p = sortperm(subset.span, by=TimeSpans.start)
        sorted = Tables.rows((recording=view(subset.recording, p), id=view(subset.id, p), span=view(subset.span, p)))
        init = first(sorted)
        push!(merged, Annotation(rid, uuid4(), init.span; from=[init.id]))
        for next in Iterators.drop(sorted, 1)
            prev = merged[end]
            if next.recording == prev.recording && TimeSpans.overlaps(next.span, prev.span)
                push!(prev.from, next.id)
                merged[end] = setproperties(prev, span=TimeSpans.shortest_timespan_containing((prev.span, next.span)))
            else
                push!(merged, Annotation(next.recording, uuid4(), next.span; from=[next.id]))
            end
        end
    end
    return merged
end