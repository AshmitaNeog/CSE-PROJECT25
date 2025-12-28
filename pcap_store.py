def normalize_packets(packets):
    normalized = []

    for pkt in packets:
        normalized.append({
            "timestamp": pkt.get("timestamp"),
            "src": pkt.get("src"),
            "dst": pkt.get("dst"),
            "protocol": pkt.get("protocol"),
            "length": pkt.get("length"),
            "flags": pkt.get("flags")
        })

    return normalized
