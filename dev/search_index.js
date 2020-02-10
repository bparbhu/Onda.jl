var documenterSearchIndex = {"docs":
[{"location":"#API-Documentation-1","page":"API Documentation","title":"API Documentation","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"Below is the documentation for all functions exported by Onda.jl. For general information regarding the Onda format, please see beacon-biosignals/OndaFormat.","category":"page"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"CurrentModule = Onda","category":"page"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"Note that Onda.jl's API follows a specific philosophy with respect to property access: users are generally expected to access fields via Julia's object.fieldname syntax, but should only mutate objects via the exposed API methods documented below.","category":"page"},{"location":"#Dataset-1","page":"API Documentation","title":"Dataset","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"Dataset\nsamples_path\ncreate_recording!\nset_duration!\nload\nstore!\ndelete!\nsave_recordings_file","category":"page"},{"location":"#Onda.Dataset","page":"API Documentation","title":"Onda.Dataset","text":"Dataset(path, custom_type=Any; create=false, strict=())\n\nReturn a Dataset instance that contains all metadata necessary to read and write to the Onda dataset stored at path. Note that this constuctor loads all the Recording objects contained in path/recordings.msgpack.zst.\n\ncustom_type is the typeof of the custom value found in each Recording object in the dataset.\n\nIf create is true, then an empty Onda dataset will be created at path.\n\nThe strict keyword argument is forwarded to MsgPack.unpack when that function is called while parsing path/recordings.msgpack.zst (see the MsgPack documentation for details regarding strict).\n\n\n\n\n\n","category":"type"},{"location":"#Onda.samples_path","page":"API Documentation","title":"Onda.samples_path","text":"samples_path(dataset::Dataset, uuid::UUID)\n\nReturn the samples subdirectory path corresponding to the recording specified by uuid.\n\n\n\n\n\nsamples_path(dataset::Dataset, uuid::UUID, name::Symbol,\n             file_extension=dataset.recordings[uuid].signals[name].file_extension)\n\nReturn the samples file path corresponding to the signal named name within the recording specified by uuid.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.create_recording!","page":"API Documentation","title":"Onda.create_recording!","text":"create_recording!(dataset::Dataset{C}, duration::Nanosecond,\n                  custom=nothing, uuid::UUID=uuid4())\n\nCreate uuid::UUID => recording::Recording where recording is constructed via the provided duration and custom arguments, uuid is the provided UUID (which is computed if not provided), add the pair to dataset.recordings, and return the pair.\n\nThe custom argument is passed along to the Recording{C} constructor, such that custom isa C must hold true.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.set_duration!","page":"API Documentation","title":"Onda.set_duration!","text":"set_duration!(dataset::Dataset{C}, uuid::UUID, duration::Nanosecond) where {C}\n\nReplace dataset.recordings[uuid] with a Recording instance that is the exact same as the existing recording, but with the duration_in_nanoseconds field set to the provided duration. Returns the newly constructed Recording instance.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.load","page":"API Documentation","title":"Onda.load","text":"load(dataset::Dataset, uuid::UUID, name::Symbol[, span::AbstractTimeSpan])\n\nLoad and return the Samples object corresponding to the signal named name in the recording specified by uuid.\n\nIf span is provided, this function returns the equivalent of load(dataset, uuid, name)[:, span], but potentially avoids loading the entire signal's worth of sample data if the underlying signal file format supports partial access/random seeks.\n\nSee also: deserialize_lpcm\n\n\n\n\n\nload(dataset::Dataset, uuid::UUID, names[, span::AbstractTimeSpan])\n\nReturn Dict(name => load(dataset, uuid, name[, span]) for name in names).\n\n\n\n\n\nload(dataset::Dataset, uuid::UUID[, span::AbstractTimeSpan])\n\nReturn load(dataset, uuid, names[, span]) where names is a list of all signal names in the recording specified by uuid.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.store!","page":"API Documentation","title":"Onda.store!","text":"store!(dataset::Dataset, uuid::UUID, name::Symbol, samples::Samples;\n       overwrite::Bool=true)\n\nAdd name => samples.signal to dataset.recordings[uuid].signals and serialize samples.data to the proper file location within dataset.path.\n\nIf overwrite is false, an error is thrown if samples already exists in recording/dataset. Otherwise, existing entries matching samples.signal will be deleted and replaced with samples.\n\n\n\n\n\n","category":"function"},{"location":"#Base.delete!","page":"API Documentation","title":"Base.delete!","text":"delete!(dataset::Dataset, uuid::UUID)\n\nDelete the recording whose UUID matches uuid from dataset. This function removes the matching Recording object from dataset.recordings, as well as deletes the corresponding subdirectory in the dataset's samples directory.\n\n\n\n\n\ndelete!(dataset::Dataset, uuid::UUID, name::Symbol)\n\nDelete the signal whose name matches name from the recording whose UUID matches uuid in dataset. This function removes the matching Signal object from dataset.recordings[uuid], as well as deletes the corresponding sample data in the dataset's samples directory.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.save_recordings_file","page":"API Documentation","title":"Onda.save_recordings_file","text":"save_recordings_file(dataset::Dataset)\n\nOverwrite joinpath(dataset.path, \"recordings.msgpack.zst\") with the contents of dataset.recordings.\n\n\n\n\n\n","category":"function"},{"location":"#Onda-Metadata-Objects-1","page":"API Documentation","title":"Onda Metadata Objects","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"Signal\nsignal_from_template\nAnnotation\nRecording\nannotate!","category":"page"},{"location":"#Onda.Signal","page":"API Documentation","title":"Onda.Signal","text":"Signal\n\nA type representing an individual Onda signal object. Instances contain the following fields, following the Onda specification for signal objects:\n\nchannel_names::Vector{Symbol}\nsample_unit::Symbol\nsample_resolution_in_unit::Float64\nsample_type::DataType\nsample_rate::UInt64\nfile_extension::Symbol\nfile_options::Union{Nothing,Dict{Symbol,Any}}\n\n\n\n\n\n","category":"type"},{"location":"#Onda.signal_from_template","page":"API Documentation","title":"Onda.signal_from_template","text":"signal_from_template(signal::Signal;\n                     channel_names=signal.channel_names,\n                     sample_unit=signal.sample_unit,\n                     sample_resolution_in_unit=signal.sample_resolution_in_unit,\n                     sample_type=signal.sample_type,\n                     sample_rate=signal.sample_rate,\n                     file_extension=signal.file_extension,\n                     file_options=signal.file_options)\n\nReturn a Signal where each field is mapped to the corresponding keyword argument.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.Annotation","page":"API Documentation","title":"Onda.Annotation","text":"Annotation <: AbstractTimeSpan\n\nA type representing an individual Onda annotation object. Instances contain the following fields, following the Onda specification for annotation objects:\n\nkey::String\nvalue::String\nstart_nanosecond::Nanosecond\nstop_nanosecond::Nanosecond\n\n\n\n\n\n","category":"type"},{"location":"#Onda.Recording","page":"API Documentation","title":"Onda.Recording","text":"Recording{C}\n\nA type representing an individual Onda recording object. Instances contain the following fields, following the Onda specification for recording objects:\n\nduration_in_nanoseconds::Nanosecond\nsignals::Dict{Symbol,Signal}\nannotations::Set{Annotation}\ncustom::C\n\n\n\n\n\n","category":"type"},{"location":"#Onda.annotate!","page":"API Documentation","title":"Onda.annotate!","text":"annotate!(recording::Recording, annotation::Annotation)\n\nReturns push!(recording.annotations, annotation).\n\n\n\n\n\n","category":"function"},{"location":"#Samples-1","page":"API Documentation","title":"Samples","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"Samples\nchannel\nchannel_count\nsample_count\nencode\nencode!\ndecode\ndecode!","category":"page"},{"location":"#Onda.Samples","page":"API Documentation","title":"Onda.Samples","text":"Samples(signal::Signal, encoded::Bool, data::AbstractMatrix)\n\nReturn a Samples instance with the following fields:\n\nsignal::Signal: The Signal object that describes the Samples instance.\nencoded::Bool: If true, the values in data are LPCM-encoded as  prescribed by the Samples instance's signal. If false, the values in  data have been decoded into the signal's canonical units.\ndata::AbstractMatrix: A matrix of sample data. The i th row of the matrix  corresponds to the ith channel in signal.channel_names, while the jth  column corresponds to the jth multichannel sample.\n\nNote that getindex and view are defined on Samples to accept normal integer indices, but also accept channel names for row indices and TimeSpan values for column indices:\n\njulia> eeg\nSamples (00:43:11.062500000):\n  signal.channel_names: [:fp1, :f3, :c3, :p3, :f7, :t3, :t5, :o1, :fz, :cz,\n                         :pz, :fp2, :f4, :c4, :p4, :f8, :t4, :t6, :o2]\n  signal.sample_unit: :microvolt\n  signal.sample_resolution_in_unit: 0.25\n  signal.sample_type: Int16\n  signal.sample_rate: 128 Hz\n  signal.file_extension: :zst\n  signal.file_options: nothing\n  encoded: true\n  data:\n19×331656 Array{Int16,2}:\n -421  -416    51  -229  …   -164   -318   -644\n -866  -860  -401  -684     -1665  -1805  -2139\n -809  -776  -320  -641     -1402  -1571  -1892\n -698  -642  -191  -522     -1391  -1585  -1891\n -801  -778  -307  -622     -1275  -1452  -1771\n -340  -297   168  -160  …  -1012  -1202  -1514\n -594  -544   -86  -410      -802   -982  -1298\n -254  -180   270   -68        68   -141   -435\n -567  -547   -86  -396     -1439  -1602  -1924\n -620  -584  -129  -450     -1486  -1664  -1970\n -595  -807  -187  -341  …  -1672  -1441  -2113\n -407  -386    71  -216      -993  -1146  -1466\n -490  -475   -17  -310      -861  -1011  -1332\n -540  -555   -79  -359     -1077   -973  -1508\n -437  -394    60  -263     -1051  -1232  -1541\n -721  -692  -239  -536  …  -1681  -1838  -2151\n -646  -597  -145  -460     -1119  -1298  -1602\n -468  -411    32  -295      -224   -411   -695\n -855  -792  -354  -686     -1584  -1782  -2065\n\njulia> eeg[[:fp1, 2, :fz, :o1, :cz], TimeSpan(Minute(20), duration(eeg))]\nSamples (00:23:11.062500000):\n  signal.channel_names: [:fp1, :f3, :fz, :o1, :cz]\n  signal.sample_unit: :microvolt\n  signal.sample_resolution_in_unit: 0.25\n  signal.sample_type: Int16\n  signal.sample_rate: 128 Hz\n  signal.file_extension: :zst\n  signal.file_options: nothing\n  encoded: true\n  data:\n5×178056 Array{Int16,2}:\n -326    69   154  -281   …   -164   -318   -644\n -596  -204  -109  -543      -1665  -1805  -2139\n -472   -59    19  -422      -1439  -1602  -1924\n -453   -17    31  -418         68   -141   -435\n -797  -373  -306  -748      -1486  -1664  -1970\n\nSee also: encode, encode!, decode, decode!\n\n\n\n\n\n","category":"type"},{"location":"#Onda.channel","page":"API Documentation","title":"Onda.channel","text":"channel(signal::Signal, name::Symbol)\n\nReturn i where signal.channel_names[i] == name.\n\n\n\n\n\nchannel(signal::Signal, i::Integer)\n\nReturn signal.channel_names[i].\n\n\n\n\n\nchannel(samples::Samples, name::Symbol)\n\nReturn channel(samples.signal, name).\n\nThis function is useful for indexing rows of samples.data by channel names.\n\n\n\n\n\nchannel(samples::Samples, i::Integer)\n\nReturn channel(samples.signal, i).\n\n\n\n\n\n","category":"function"},{"location":"#Onda.channel_count","page":"API Documentation","title":"Onda.channel_count","text":"channel_count(signal::Signal)\n\nReturn length(signal.channel_names).\n\n\n\n\n\nchannel_count(samples::Samples)\n\nReturn channel_count(samples.signal).\n\n\n\n\n\n","category":"function"},{"location":"#Onda.sample_count","page":"API Documentation","title":"Onda.sample_count","text":"sample_count(samples::Samples)\n\nReturn the number of multichannel samples in samples (i.e. size(samples.data, 2))\n\n\n\n\n\n","category":"function"},{"location":"#Onda.encode","page":"API Documentation","title":"Onda.encode","text":"encode(sample_type::DataType, sample_resolution_in_unit, samples, dither_storage=nothing)\n\nReturn a copy of samples quantized according to sample_type and sample_resolution_in_unit. sample_type must be a concrete subtype of Onda.VALID_SAMPLE_TYPE_UNION. Quantization of an individual sample s is performed via:\n\nround(S, s / sample_resolution_in_unit)\n\nwith additional special casing to clip values exceeding the encoding's dynamic range.\n\nIf dither_storage isa Nothing, no dithering is applied before quantization.\n\nIf dither_storage isa Missing, dither storage is allocated automatically and triangular dithering is applied to the signal prior to quantization.\n\nOtherwise, dither_storage must be a container of similar shape and type to samples. This container is then used to store the random noise needed for the triangular dithering process, which is applied to the signal prior to quantization.\n\n\n\n\n\nencode(samples::Samples, dither_storage=nothing)\n\nIf samples.encoded is false, return a Samples instance that wraps:\n\nencode(samples.signal.sample_type,\n       samples.signal.sample_resolution_in_unit,\n       samples.data, dither_storage)\n\nIf samples.encoded is true, this function is the identity.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.encode!","page":"API Documentation","title":"Onda.encode!","text":"encode!(result_storage, sample_type::DataType, sample_resolution_in_unit, samples, dither_storage=nothing)\nencode!(result_storage, sample_resolution_in_unit, samples, dither_storage=nothing)\n\nSimilar to encode(sample_type, sample_resolution_in_unit, samples, dither_storage), but write encoded values to result_storage rather than allocating new storage.\n\nsample_type defaults to eltype(result_storage) if it is not provided.\n\n\n\n\n\nencode!(result_storage, samples::Samples, dither_storage=nothing)\n\nIf samples.encoded is false, return a Samples instance that wraps:\n\nencode!(result_storage,\n        samples.signal.sample_type,\n        samples.signal.sample_resolution_in_unit,\n        samples.data, dither_storage)`.\n\nIf samples.encoded is true, return a Samples instance that wraps copyto!(result_storage, samples.data).\n\n\n\n\n\n","category":"function"},{"location":"#Onda.decode","page":"API Documentation","title":"Onda.decode","text":"decode(sample_resolution_in_unit, samples)\n\nReturn sample_resolution_in_unit .* samples\n\n\n\n\n\ndecode(samples::Samples)\n\nIf samples.encoded is true, return a Samples instance that wraps decode(samples.signal.sample_resolution_in_unit, samples.data).\n\nIf samples.encoded is false, this function is the identity.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.decode!","page":"API Documentation","title":"Onda.decode!","text":"decode!(result_storage, sample_resolution_in_unit, samples)\n\nSimilar to decode(sample_resolution_in_unit, samples), but write decoded values to result_storage rather than allocating new storage.\n\n\n\n\n\ndecode!(result_storage, samples::Samples)\n\nIf samples.encoded is true, return a Samples instance that wraps decode!(result_storage, samples.signal.sample_resolution_in_unit, samples.data).\n\nIf samples.encoded is false, return a Samples instance that wraps copyto!(result_storage, samples.data).\n\n\n\n\n\n","category":"function"},{"location":"#AbstractTimeSpan-1","page":"API Documentation","title":"AbstractTimeSpan","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"AbstractTimeSpan\nTimeSpan\ncontains\noverlaps\nshortest_timespan_containing\nduration","category":"page"},{"location":"#Onda.AbstractTimeSpan","page":"API Documentation","title":"Onda.AbstractTimeSpan","text":"AbstractTimeSpan\n\nA type repesenting a continuous, inclusive span between two points in time.\n\nAll subtypes of AbstractTimeSpan must implement:\n\nfirst(::AbstractTimeSpan)::Nanosecond: return the first nanosecond contained in span\nlast(::AbstractTimeSpan)::Nanosecond: return the last nanosecond contained in span\n\nFor convenience, many Onda functions that accept AbstractTimeSpan values also accept Dates.Period values.\n\nSee also: TimeSpan\n\n\n\n\n\n","category":"type"},{"location":"#Onda.TimeSpan","page":"API Documentation","title":"Onda.TimeSpan","text":"TimeSpan(first, last)\n\nReturn TimeSpan(Nanosecond(first), Nanosecond(last))::AbstractTimeSpan.\n\nSee also: AbstractTimeSpan\n\n\n\n\n\n","category":"type"},{"location":"#Onda.contains","page":"API Documentation","title":"Onda.contains","text":"contains(a, b)\n\nReturn true if the timespan b lies entirely within the timespan a, return false otherwise.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.overlaps","page":"API Documentation","title":"Onda.overlaps","text":"overlaps(a, b)\n\nReturn true if the timespan a and the timespan b overlap, return false otherwise.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.shortest_timespan_containing","page":"API Documentation","title":"Onda.shortest_timespan_containing","text":"shortest_timespan_containing(spans)\n\nReturn the shortest possible TimeSpan containing all timespans in spans.\n\nspans is assumed to be an iterable of timespans.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.duration","page":"API Documentation","title":"Onda.duration","text":"duration(span)\n\nReturn the duration of span as a Period.\n\nFor span::AbstractTimeSpan, this is equivalent to last(span) - first(span).\n\nFor span::Period, this function is the identity.\n\n\n\n\n\nduration(recording::Recording)\n\nReturns recording.duration_in_nanoseconds.\n\n\n\n\n\nduration(samples::Samples)\n\nReturns the Nanosecond value for which samples[TimeSpan(0, duration(samples))] == samples.data.\n\n\n\n\n\n","category":"function"},{"location":"#Serialization-1","page":"API Documentation","title":"Serialization","text":"","category":"section"},{"location":"#","page":"API Documentation","title":"API Documentation","text":"AbstractLPCMSerializer\nOnda.serializer_constructor_for_file_extension\nserializer\ndeserialize_lpcm\nserialize_lpcm\nLPCM\nLPCMZst","category":"page"},{"location":"#Onda.AbstractLPCMSerializer","page":"API Documentation","title":"Onda.AbstractLPCMSerializer","text":"AbstractLPCMSerializer\n\nA type whose subtypes support:\n\ndeserialize_lpcm\nserialize_lpcm\n\nAll definitions of subtypes of the form S<:AbstractLPCMSerializer must also support a constructor of the form S(::Signal) and overload Onda.serializer_constructor_for_file_extension with the appropriate file extension.\n\nSee also: serializer, LPCM, LPCMZst\n\n\n\n\n\n","category":"type"},{"location":"#Onda.serializer_constructor_for_file_extension","page":"API Documentation","title":"Onda.serializer_constructor_for_file_extension","text":"Onda.serializer_constructor_for_file_extension(::Val{:extension_symbol})\n\nReturn a constructor of the form S(::Signal)::AbstractLPCMSerializer corresponding to the provided extension.\n\nThis function should be overloaded for new AbstractLPCMSerializer subtypes.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.serializer","page":"API Documentation","title":"Onda.serializer","text":"serializer(signal::Signal; kwargs...)\n\nReturn S(signal; kwargs...) where S is the AbstractLPCMSerializer that corresponds to signal.file_extension (as determined by the serializer author via serializer_constructor_for_file_extension).\n\nSee also: deserialize_lpcm, serialize_lpcm\n\n\n\n\n\n","category":"function"},{"location":"#Onda.deserialize_lpcm","page":"API Documentation","title":"Onda.deserialize_lpcm","text":"deserialize_lpcm(bytes, serializer::AbstractLPCMSerializer)\n\nReturn a channels-by-timesteps AbstractMatrix of interleaved LPCM-encoded sample data by deserializing the provided bytes from the given serializer.\n\nNote that this operation may be performed in a zero-copy manner such that the returned sample matrix directly aliases bytes.\n\nThis function is the inverse of the corresponding serialize_lpcm method, i.e.:\n\nserialize_lpcm(deserialize_lpcm(bytes, serializer), serializer) == bytes\n\ndeserialize_lpcm(bytes, serializer::AbstractLPCMSerializer, sample_offset, sample_count)\n\nSimilar to deserialize_lpcm(bytes, serializer), but deserialize only the segment requested via sample_offset and sample_count.\n\ndeserialize_lpcm(io::IO, serializer::AbstractLPCMSerializer[, sample_offset, sample_count])\n\nSimilar to the corresponding deserialize_lpcm(bytes, ...) methods, but the bytes to be deserialized are read directly from io.\n\nIf sample_offset/sample_count is provided and io/serializer support seeking, implementations of this method may read only the bytes required to extract the requested segment instead of reading the entire stream.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.serialize_lpcm","page":"API Documentation","title":"Onda.serialize_lpcm","text":"serialize_lpcm(samples::AbstractMatrix, serializer::AbstractLPCMSerializer)\n\nReturn the AbstractVector{UInt8} of bytes that results from serializing samples to the given serializer, where samples is a channels-by-timesteps matrix of interleaved LPCM-encoded sample data.\n\nNote that this operation may be performed in a zero-copy manner such that the returned AbstractVector{UInt8} directly aliases samples.\n\nThis function is the inverse of the corresponding deserialize_lpcm method, i.e.:\n\ndeserialize_lpcm(serialize_lpcm(samples, serializer), serializer) == samples\n\nserialize_lpcm(io::IO, samples::AbstractMatrix, serializer::AbstractLPCMSerializer)\n\nSimilar to the corresponding serialize_lpcm(samples, serializer) method, but serializes directly to io.\n\n\n\n\n\n","category":"function"},{"location":"#Onda.LPCM","page":"API Documentation","title":"Onda.LPCM","text":"LPCM{S}(channel_count)\nLPCM(signal::Signal)\n\nReturn a LPCM<:AbstractLPCMSerializer instance corresponding to Onda's default interleaved LPCM format assumed for signal files with the \".lpcm\" extension.\n\nS corresponds to signal.sample_type, while channel_count corresponds to signal.channel_names.\n\nNote that bytes (de)serialized via this serializer are little-endian per the Onda specification.\n\n\n\n\n\n","category":"type"},{"location":"#Onda.LPCMZst","page":"API Documentation","title":"Onda.LPCMZst","text":"LPCMZst(lpcm::LPCM; level=3)\nLPCMZst(signal::Signal; level=3)\n\nReturn a LPCMZst<:AbstractLPCMSerializer instance that corresponds to Onda's default interleaved LPCM format compressed by zstd. This serializer is assumed for signal files with the \".lpcm.zst\" extension.\n\nThe level keyword argument sets the same compression level parameter as the corresponding flag documented by the zstd command line utility.\n\nSee https://facebook.github.io/zstd/ for details about zstd.\n\n\n\n\n\n","category":"type"}]
}
