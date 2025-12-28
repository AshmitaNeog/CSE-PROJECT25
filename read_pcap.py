from scapy.all import rdpcap, IP, TCP
from datetime import datetime
from scapy.all import rdpcap, IP, TCP, UDP, ICMP
from datetime import datetime

PROTO_MAP = {
    6: "TCP",
    17: "UDP",
    1: "ICMP"
}


def read_pcap(path):
    packets = rdpcap(path)
    data = []

    for pkt in packets:
        if IP in pkt:
            # --- REAL TCP FLAGS ---
            flags = None
            if TCP in pkt:
                flags = str(pkt[TCP].flags)

            # --- REAL FRAGMENTATION ---
            fragmented = False
            if pkt[IP].frag > 0 or pkt[IP].flags.MF == 1:
                fragmented = True

            port = None
            if TCP in pkt:
                 port = pkt[TCP].dport
                 
            elif UDP in pkt:
                port = pkt[UDP].dport


            data.append({
                "src": pkt[IP].src,
                "dst": pkt[IP].dst,
                "protocol": PROTO_MAP.get(pkt[IP].proto, str(pkt[IP].proto)),
                "ttl": pkt[IP].ttl,
                "length": len(pkt),
                "flags": pkt[TCP].flags if TCP in pkt else None,
                "fragmentation": pkt[IP].flags.MF == 1 or pkt[IP].frag > 0,
                "port": port,
                "timestamp": datetime.fromtimestamp(float(pkt.time)).strftime("%H:%M:%S")
            })


    return data


