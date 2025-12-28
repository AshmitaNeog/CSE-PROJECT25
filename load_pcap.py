from scapy.all import rdpcap, IP, TCP
from datetime import datetime

def load_pcap(file_path):
    packets = rdpcap(file_path)
    data = []

    for pkt in packets:
        if IP in pkt:
            packet_info = {
                "src": pkt[IP].src,
                "dst": pkt[IP].dst,
                "ttl": pkt[IP].ttl,
                "protocol": pkt[IP].proto,
                "length": len(pkt),
                "timestamp": datetime.fromtimestamp(float(pkt.time)).strftime("%Y-%m-%d %H:%M:%S")
            }

            if TCP in pkt:
                packet_info["tcp_flags"] = str(pkt[TCP].flags)
            else:
                packet_info["tcp_flags"] = None

            data.append(packet_info)
    return data
