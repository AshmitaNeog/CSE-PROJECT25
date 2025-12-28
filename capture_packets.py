from scapy.all import sniff, IP, TCP, wrpcap
from datetime import datetime


def capture_packets(count=10):
    packets = sniff(count=count)
    wrpcap("pcap_files/scapy_capture.pcapng", packets)  # ✅ ADD THIS
    data = []

    for pkt in packets:
        if IP in pkt:
            packet_info = {
                "src": pkt[IP].src,
                "dst": pkt[IP].dst,
                "ttl": pkt[IP].ttl,
                "protocol": pkt[IP].proto,
                "length": len(pkt),
                "timestamp": datetime.fromtimestamp(pkt.time).strftime("%H:%M:%S")
            }

            if TCP in pkt:
                packet_info["tcp_flags"] = str(pkt[TCP].flags)
            else:
                packet_info["tcp_flags"] = None

            data.append(packet_info)

    return data
