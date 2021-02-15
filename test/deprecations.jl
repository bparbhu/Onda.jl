@testset "upgrade_onda_dataset_to_v0_5!" begin
    new_path = mktempdir()
    old_path = joinpath(@__DIR__, "old_test_v0_3.onda")
    cp(old_path, new_path; force=true)
    Onda.upgrade_onda_dataset_to_v0_5!(new_path)
    signals = DataFrame(read_signals(joinpath(new_path, "upgraded.onda.signals.arrow")))
    annotations = DataFrame(read_annotations(joinpath(new_path, "upgraded.onda.annotations.arrow")))
    _, old_recordings = MsgPack.unpack(Onda.zstd_decompress(read(joinpath(new_path, "recordings.msgpack.zst"))))
    new_recordings = Onda.gather(:recording, signals, annotations)
    for (uuid, old_recording) in old_recordings
        new_signals, new_annotations = new_recordings[UUID(uuid)]
        @test length(old_recording["signals"]) == nrow(new_signals)
        @test length(old_recording["annotations"]) == nrow(new_annotations)
        for (old_kind, old_signal) in old_recording["signals"]
            new_signal = view(new_signals, findall(==(old_kind), new_signals.kind), :)
            @test nrow(new_signal) == 1
            @test new_signal.file_path[] == joinpath("samples", uuid, old_kind * "." * old_signal["file_extension"])
            @test new_signal.file_format[] == old_signal["file_extension"]
            @test new_signal.span[] == TimeSpan(old_signal["start_nanosecond"], old_signal["stop_nanosecond"])
            @test new_signal.channels[] == old_signal["channel_names"]
            @test new_signal.sample_unit[] == old_signal["sample_unit"]
            @test new_signal.sample_resolution_in_unit[] == old_signal["sample_resolution_in_unit"]
            @test new_signal.sample_offset_in_unit[] == old_signal["sample_offset_in_unit"]
            @test new_signal.sample_type[] == old_signal["sample_type"]
            @test new_signal.sample_rate[] == old_signal["sample_rate"]
        end
        for old_annotation in old_recording["annotations"]
            old_span = TimeSpan(old_annotation["start_nanosecond"], old_annotation["stop_nanosecond"])
            new_annotation = filter(a -> a.value == old_annotation["value"] && a.span == old_span, new_annotations)
            @test nrow(new_annotation) == 1
            @test new_annotation.recording[] == UUID(uuid)
        end
    end
end