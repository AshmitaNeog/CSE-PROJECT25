def detect_anomalies(packets):
    alerts = []

    for i, pkt in enumerate(packets):
        if pkt["ttl"] < 10:
            alerts.append(f"Low TTL anomaly in packet {i+1}")

        if pkt["packet_length"] > 1500:
            alerts.append(f"Large packet anomaly in packet {i+1}")

        if pkt["tcp_flags"] in ["F", "R"]:
            alerts.append(f"Suspicious TCP flag in packet {i+1}")

    return alerts
