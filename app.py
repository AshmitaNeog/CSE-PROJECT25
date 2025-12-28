
from flask import Flask, jsonify, request
from flask_cors import CORS
from read_pcap import read_pcap
from capture_packets import capture_packets

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Packet Analyzer Backend Running"

@app.route("/stats")
def stats():
    packets = read_pcap("pcap_files/live_capture.pcapng")

    total_packets = len(packets)
    anomalies = sum(
        1 for p in packets
        if p["length"] > 500 or p["ttl"] <= 1
    )

    protocol_count = {}
    for p in packets:
        proto = p["protocol"]
        protocol_count[proto] = protocol_count.get(proto, 0) + 1

    return jsonify({
        "total_packets": total_packets,
        "anomalies": anomalies,
        "protocols": protocol_count
    })

@app.route("/timeline")
def timeline():
    packets = read_pcap("pcap_files/live_capture.pcapng")

    timeline = {}
    for p in packets:
        t = p["timestamp"]
        timeline[t] = timeline.get(t, 0) + 1

    return jsonify(timeline)

# 🔴 LIVE CAPTURE ENDPOINT
@app.route("/live")
def live_capture():
    from capture_packets import capture_packets
    packets = capture_packets(count=10)
    return jsonify({
        "live_packets": len(packets)
    })


@app.route("/anomalies")
def anomaly_details():
    packets = read_pcap("pcap_files/live_capture.pcapng")

    anomaly_list = []
    anomaly_counts = {
        "TTL": 0,
        "SIZE": 0,
        "FRAGMENTATION": 0,
        "FLAGS": 0
    }

    for p in packets:
        if p["ttl"] <= 1:
            anomaly_counts["TTL"] += 1
            anomaly_list.append({
                "type": "TTL",
                "description": f"Low TTL detected ({p['ttl']})",
                "timestamp": p["timestamp"]
            })

        if p["length"] > 500:
            anomaly_counts["SIZE"] += 1
            anomaly_list.append({
                "type": "SIZE",
                "description": f"Large packet ({p['length']} bytes)",
                "timestamp": p["timestamp"]
            })

        if p.get("fragmentation", False):
            anomaly_counts["FRAGMENTATION"] += 1
            anomaly_list.append({
                "type": "FRAGMENTATION",
                "description": "Fragmented packet detected",
                "timestamp": p["timestamp"]
            })

        flags = p.get("flags")

        # Only evaluate TCP packets
        if flags:
            # suspicious if no SYN or ACK bit at all
            if "S" not in flags and "A" not in flags:
                anomaly_counts["FLAGS"] += 1
                anomaly_list.append({
                    "type": "FLAGS",
                    "description": f"Suspicious TCP flags ({flags})",
                    "timestamp": p["timestamp"]
                })


    return jsonify({
        "counts": anomaly_counts,
        "alerts": anomaly_list[:20]  # limit alerts
    })


@app.route("/compare", methods=["POST"])
def compare_pcaps():
    from compare_packets import compare_pcaps

    data = request.json
    protocols = data.get("protocols", [])
    ports = data.get("ports", [])
    features = data.get("features", [])

    result = compare_pcaps(
        scapy_pcap="pcap_files/live_capture.pcapng",
        wireshark_pcap=data["wireshark_pcap"],
        protocols=protocols,
        ports=ports,
        features=features
    )

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
