THREAT_DB = {
    "DDoS": {
        "attack_category": "Availability",
        "severity": "Critical",
        "risk_explanation": "A Distributed Denial of Service (DDoS) attack attempts to exhaust network or application resources, making the service unavailable to legitimate users.",
        "recommended_mitigation": "Enable rate limiting, configure WAF rules to drop malicious traffic patterns, and scale up resources. Consider enabling a DDoS protection service.",
        "references_json": {"cwe": "CWE-400", "mitre": "T1498"}
    },
    "Brute Force": {
        "attack_category": "Credential Access",
        "severity": "High",
        "risk_explanation": "An attacker is repeatedly guessing credentials to gain unauthorized access to a system or service.",
        "recommended_mitigation": "Enforce account lockout policies, require strong passwords, implement Multi-Factor Authentication (MFA), and block the offending source IPs.",
        "references_json": {"cwe": "CWE-307", "mitre": "T1110"}
    },
    "Port Scan": {
        "attack_category": "Discovery",
        "severity": "Low",
        "risk_explanation": "An attacker is mapping the network to find open ports and running services, often a precursor to a more targeted attack.",
        "recommended_mitigation": "Ensure firewalls block unexpected inbound ports. Monitor the source IP for follow-up attacks.",
        "references_json": {"cwe": "CWE-200", "mitre": "T1046"}
    },
    "Web Attack": {
        "attack_category": "Initial Access",
        "severity": "High",
        "risk_explanation": "Traffic matching common web application exploits, such as SQL Injection or Cross-Site Scripting (XSS).",
        "recommended_mitigation": "Deploy a Web Application Firewall (WAF), sanitize all user inputs, and ensure software dependencies are patched.",
        "references_json": {"cwe": "CWE-89", "mitre": "T1190"}
    },
    "Botnet": {
        "attack_category": "Command and Control",
        "severity": "Critical",
        "risk_explanation": "Internal hosts are communicating with known Botnet Command and Control (C2) servers, indicating compromise.",
        "recommended_mitigation": "Isolate the affected internal hosts immediately, run malware scans, and block outbound traffic to the C2 IP addresses.",
        "references_json": {"cwe": "CWE-358", "mitre": "T1071"}
    }
}
