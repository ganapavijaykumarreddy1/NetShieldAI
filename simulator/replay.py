from scapy.all import rdpcap, sendp, conf, Ether, get_if_hwaddr
import os

def replay_traffic(pcap_file, interface=None):
    if interface is None:
        interface = conf.iface
    print(f"[*] Loading packets from {pcap_file}...")
    if not os.path.exists(pcap_file):
        print(f"[-] Error: Could not find file '{pcap_file}'")
        return

    try:
        packets = rdpcap(pcap_file)
        print(f"[*] Successfully loaded {len(packets)} packets.")
        print(f"[*] Replaying packets on interface '{interface}'...")
        
        try:
            my_mac = get_if_hwaddr(interface)
            for p in packets:
                if Ether in p:
                    p[Ether].src = my_mac
                    p[Ether].dst = "ff:ff:ff:ff:ff:ff" 
        except Exception:
            pass
            
        sendp(packets, iface=interface, inter=0.01, verbose=True)
        print("[*] Replay complete!")
        
    except Exception as e:
        print(f"[-] An error occurred: {e}")
