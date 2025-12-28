from read_pcap import read_pcap


def compare_packets(scapy_packets, wireshark_packets):
    mismatches = []

    min_len = min(len(scapy_packets), len(wireshark_packets))

    for i in range(min_len):
        s = scapy_packets[i]
        w = wireshark_packets[i]

        for key in s:
            if key in w and s[key] != w[key]:
                mismatches.append({
                    "packet_no": i + 1,
                    "field": key,
                    "scapy_value": s[key],
                    "wireshark_value": w[key]
                })

    return mismatches


def compare_pcaps(scapy_pcap, wireshark_pcap, protocols, ports, features):
    scapy_packets = read_pcap(scapy_pcap)
    wireshark_packets = read_pcap(wireshark_pcap)

    print("SCAPY packets:", len(scapy_packets))
    print("WIRESHARK packets:", len(wireshark_packets))

    print("Protocols filter:", protocols)
    print("Ports filter:", ports)
    print("Features filter:", features)

    mismatches = []

    for s_pkt, w_pkt in zip(scapy_packets, wireshark_packets):

        if protocols and s_pkt["protocol"] not in protocols:
            print("SKIPPED by protocol:", s_pkt["protocol"])
            continue

        if ports and s_pkt.get("port") not in ports:
            print("SKIPPED by port:", s_pkt.get("port"))
            continue


        for feature in features:
            s_val = s_pkt.get(feature)
            w_val = w_pkt.get(feature)

            if s_val != w_val:
                print(
                    f"MISMATCH → {feature}:",
                    s_val,
                    w_val,
                    "at",
                    s_pkt["timestamp"]
                )

                mismatches.append({
                    "field": feature,
                    "scapy": s_val,
                    "wireshark": w_val,
                    "timestamp": s_pkt["timestamp"]
                })

    print("TOTAL mismatches:", len(mismatches))

    return {
        "total_compared": len(mismatches),
        "mismatches": mismatches
    }



