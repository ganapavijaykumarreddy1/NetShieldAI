import os
import logging
from scapy.all import rdpcap, sendp, conf, Ether, get_if_hwaddr

logger = logging.getLogger("netshield_replayer")

class PcapReplayer:
    """
    Replays raw PCAP binary packet files over the active OS Network Interface Card (NIC).
    """

    @staticmethod
    def replay_pcap_over_nic(pcap_path: str, interface: str = None) -> bool:
        if not os.path.exists(pcap_path):
            logger.error(f"Cannot replay: file '{pcap_path}' does not exist.")
            return False

        try:
            iface = interface or conf.iface
            packets = rdpcap(pcap_path)
            if not packets:
                return False

            logger.info(f"Replaying {len(packets)} raw packets from '{os.path.basename(pcap_path)}' over NIC interface '{iface}'...")

            # Attempt to set local NIC MAC address if available
            try:
                my_mac = get_if_hwaddr(iface)
                for p in packets:
                    if Ether in p:
                        p[Ether].src = my_mac
            except Exception:
                pass

            # Transmit raw Ethernet/IP frames across network socket driver (Npcap/WinPcap)
            sendp(packets, iface=iface, inter=0.002, verbose=False)
            logger.info(f"Successfully transmitted {len(packets)} raw network frames across NIC '{iface}'.")
            return True
        except Exception as e:
            logger.warning(f"NIC raw packet transmission note: {e} (Inference & SOC workflow proceeding normally).")
            return False
