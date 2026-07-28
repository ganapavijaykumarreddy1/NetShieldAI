class NetworkException(Exception):
    """Base exception for network operations."""
    pass

class PacketCaptureError(NetworkException):
    """Raised when there is an error during packet capture."""
    pass

class InterfaceNotFoundError(NetworkException):
    """Raised when the specified network interface is not found."""
    pass

class PacketParsingError(NetworkException):
    """Raised when a packet cannot be parsed."""
    pass
