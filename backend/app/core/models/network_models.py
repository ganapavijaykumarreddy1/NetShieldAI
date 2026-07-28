from enum import Enum

class Protocol(str, Enum):
    TCP = "TCP"
    UDP = "UDP"
    ICMP = "ICMP"
    ARP = "ARP"
    OTHER = "OTHER"

class ConnectionState(str, Enum):
    NEW = "NEW"
    ESTABLISHED = "ESTABLISHED"
    CLOSED = "CLOSED"
    UNKNOWN = "UNKNOWN"
