import argparse
from simulator.replay import replay_traffic
from simulator.dos import generate_dos_pcap

def main():
    parser = argparse.ArgumentParser(description="NetShieldAI Traffic Simulator CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Replay command
    replay_parser = subparsers.add_parser("replay", help="Replay a PCAP file on the network")
    replay_parser.add_argument("pcap", help="Path to the .pcap file you want to replay")
    replay_parser.add_argument("--iface", default=None, help="Network interface to use")

    # Generate DoS command
    dos_parser = subparsers.add_parser("dos", help="Generate a synthetic DoS PCAP file")
    dos_parser.add_argument("--output", default="simulator/data/dos_attack.pcap", help="Output path for the generated PCAP")
    dos_parser.add_argument("--count", type=int, default=5000, help="Number of packets to generate")

    args = parser.parse_args()

    if args.command == "replay":
        replay_traffic(args.pcap, args.iface)
    elif args.command == "dos":
        generate_dos_pcap(args.output, args.count)
        print("[*] Automatically replaying the generated DoS attack...")
        replay_traffic(args.output, None)

if __name__ == "__main__":
    main()
