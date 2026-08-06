import smtplib
from email.message import EmailMessage
import logging
import threading
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.soc import Alert
from app.soc.notifications.interfaces import NotificationProvider
from app.core.config import settings
from datetime import datetime

logger = logging.getLogger("netshield_gmail")

class GmailNotificationProvider(NotificationProvider):
    @property
    def provider_name(self) -> str:
        return "Gmail"

    def _generate_alert_html(self, alert: Alert) -> str:
        severity_color = "#ef4444" if alert.severity == "Critical" else ("#f97316" if alert.severity == "High" else "#eab308")
        timestamp_str = alert.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC') if hasattr(alert.timestamp, 'strftime') else str(alert.timestamp)
        confidence_pct = f"{alert.confidence * 100:.1f}%" if alert.confidence is not None else "N/A"
        risk_score_str = f"{alert.risk_score:.1f}" if alert.risk_score is not None else "0.0"

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0e14; color: #e2e8f0; margin: 0; padding: 24px; }}
                .card {{ max-width: 600px; margin: 0 auto; background-color: #111318; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
                .header {{ background: linear-gradient(135deg, #181b24 0%, #111318 100%); border-bottom: 2px solid {severity_color}; padding: 20px 24px; }}
                .header-title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 8px; }}
                .badge {{ display: inline-block; background-color: {severity_color}22; color: {severity_color}; border: 1px solid {severity_color}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 8px; }}
                .content {{ padding: 24px; }}
                .grid-table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
                .grid-table td {{ padding: 10px 12px; border-bottom: 1px solid #1e293b; font-size: 14px; }}
                .label {{ color: #94a3b8; font-weight: 500; width: 35%; }}
                .value {{ color: #ffffff; font-family: 'Courier New', monospace; font-weight: 600; }}
                .action-box {{ background-color: #1e293b55; border-left: 4px solid #00f0ff; padding: 14px 16px; border-radius: 4px; margin-top: 16px; }}
                .action-title {{ font-size: 13px; color: #00f0ff; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }}
                .action-text {{ font-size: 14px; color: #cbd5e1; margin: 0; }}
                .footer {{ background-color: #0c0e14; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937; }}
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h2 class="header-title">🛡️ NetShield AI Security Alert</h2>
                    <div class="badge">[{alert.severity.upper()}] {alert.attack_type} DETECTED</div>
                </div>
                <div class="content">
                    <p style="margin-top: 0; color: #cbd5e1; font-size: 14px;">An anomalous flow has been classified by NetShield AI Threat Intelligence Pipeline.</p>
                    
                    <table class="grid-table">
                        <tr>
                            <td class="label">Alert ID:</td>
                            <td class="value">{alert.alert_id}</td>
                        </tr>
                        <tr>
                            <td class="label">Timestamp:</td>
                            <td class="value">{timestamp_str}</td>
                        </tr>
                        <tr>
                            <td class="label">Attack Type:</td>
                            <td class="value" style="color: {severity_color};">{alert.attack_type}</td>
                        </tr>
                        <tr>
                            <td class="label">Source Endpoint:</td>
                            <td class="value">{alert.src_ip}</td>
                        </tr>
                        <tr>
                            <td class="label">Target Endpoint:</td>
                            <td class="value">{alert.dst_ip}</td>
                        </tr>
                        <tr>
                            <td class="label">Protocol:</td>
                            <td class="value">{alert.protocol}</td>
                        </tr>
                        <tr>
                            <td class="label">Risk Score:</td>
                            <td class="value">{risk_score_str}/100 (Confidence: {confidence_pct})</td>
                        </tr>
                    </table>

                    <div class="action-box">
                        <div class="action-title">Recommended SOC Mitigation:</div>
                        <p class="action-text">{alert.recommended_action or 'Investigate source IP and inspect related firewall logs.'}</p>
                    </div>
                </div>
                <div class="footer">
                    Sent automatically by NetShield AI Security Operations Center &bull; Live Threat Defense Engine
                </div>
            </div>
        </body>
        </html>
        """

    def _send_smtp_payload(self, subject: str, html_content: str, recipient: Optional[str] = None, sender: Optional[str] = None, password: Optional[str] = None, server_host: Optional[str] = None, server_port: Optional[int] = None) -> Dict[str, Any]:
        smtp_server = server_host or getattr(settings, "SMTP_SERVER", "smtp.gmail.com")
        smtp_port = server_port or getattr(settings, "SMTP_PORT", 587)
        sender_email = sender or getattr(settings, "SMTP_SENDER_EMAIL", "")
        app_password = password or getattr(settings, "SMTP_APP_PASSWORD", "")
        to_email = recipient or getattr(settings, "SMTP_RECIPIENT_EMAIL", "")

        if not sender_email or sender_email == "your_email@gmail.com":
            logger.warning("SMTP Sender Email not configured. Skipping email dispatch.")
            return {"success": False, "error": "SMTP Sender Email is not configured. Please set your credentials in Settings."}

        if not app_password or app_password == "your_app_password":
            logger.warning("SMTP App Password not configured. Skipping email dispatch.")
            return {"success": False, "error": "SMTP App Password is not configured. Please generate a Gmail App Password."}

        try:
            msg = EmailMessage()
            msg['Subject'] = subject
            msg['From'] = sender_email
            msg['To'] = to_email

            msg.set_content("Please enable HTML to view this alert.")
            msg.add_alternative(html_content, subtype='html')

            with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(sender_email, app_password)
                server.send_message(msg)

            logger.info(f"Email successfully dispatched to {to_email}")
            return {"success": True, "message": f"Email successfully sent to {to_email}"}
        except Exception as e:
            logger.error(f"SMTP Delivery failed: {e}")
            return {"success": False, "error": str(e)}

    def send(self, alert: Alert, db: Session) -> bool:
        """
        Background non-blocking send for live alert engine
        """
        # Condition check for auto-alerting
        if alert.severity not in ["High", "Critical"] and "Port Scan" not in alert.attack_type and "Brute Force" not in alert.attack_type:
            return True

        def _async_worker():
            subject = f"[{alert.severity.upper()}] NetShield AI Threat Alert - {alert.attack_type} ({alert.src_ip})"
            html = self._generate_alert_html(alert)
            self._send_smtp_payload(subject, html)

        # Dispatch in background thread so detection loop is never blocked
        thread = threading.Thread(target=_async_worker, daemon=True)
        thread.start()
        return True

    def send_alert_manual(self, alert: Alert, recipient: Optional[str] = None) -> Dict[str, Any]:
        """
        Synchronous manual alert dispatch for instant user feedback
        """
        subject = f"[{alert.severity.upper()}] NetShield AI Security Alert - {alert.attack_type}"
        html = self._generate_alert_html(alert)
        return self._send_smtp_payload(subject, html, recipient=recipient)

    def send_test_email(self, recipient: Optional[str] = None, sender: Optional[str] = None, password: Optional[str] = None, server: Optional[str] = None, port: Optional[int] = None) -> Dict[str, Any]:
        """
        Dispatch a test verification email
        """
        test_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
        subject = "🛡️ NetShield AI - Test Alert Notification"
        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #0c0e14; color: #e2e8f0; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #111318; border: 1px solid #00f0ff; border-radius: 8px; padding: 24px;">
                <h2 style="color: #00f0ff; margin-top: 0;">NetShield AI Email Service Verified</h2>
                <p style="color: #cbd5e1;">Your SMTP notification pipeline is operational and ready to dispatch real-time cybersecurity incident alerts.</p>
                <p style="color: #94a3b8; font-size: 13px;">Timestamp: {test_time}</p>
                <div style="background: #1e293b; padding: 10px; border-radius: 4px; font-size: 12px; color: #10b981; font-family: monospace;">
                    STATUS: Operational &bull; Protocol: TLS &bull; Engine: NetShield SOC v1.0
                </div>
            </div>
        </body>
        </html>
        """
        return self._send_smtp_payload(
            subject=subject,
            html_content=html,
            recipient=recipient,
            sender=sender,
            password=password,
            server_host=server,
            server_port=port
        )

