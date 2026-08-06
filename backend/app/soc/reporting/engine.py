import os
import uuid
import csv
from datetime import datetime, timezone
from typing import Optional

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from sqlalchemy.orm import Session
from app.models.soc import Alert, Incident, ReportHistory
from app.soc.analytics.service import AnalyticsService

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header line
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.75)
        self.line(40, 755, 572, 755)
        self.drawString(40, 762, "NETSHIELD AI — EXECUTIVE SECURITY OPERATIONS REPORT")
        self.drawRightString(572, 762, "RESTRICTED // SOC CONFIDENTIAL")

        # Footer line
        self.line(40, 45, 572, 45)
        self.setFont("Helvetica", 8)
        self.drawString(40, 32, f"Automated Telemetry • Page {self._pageNumber} of {page_count}")
        self.drawRightString(572, 32, "NetShield AI Threat Intelligence Pipeline")
        self.restoreState()

class ReportingEngine:
    db: Session
    user_id: Optional[int]

    def __init__(self, db: Session, user_id: Optional[int] = None):
        self.db = db
        self.user_id = user_id
        self.reports_dir = os.path.join(os.getcwd(), 'reports_output')
        os.makedirs(self.reports_dir, exist_ok=True)
        self.analytics = AnalyticsService(db)

    def generate_daily_summary_pdf(self) -> str:
        filename = f"executive_soc_report_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.reports_dir, filename)
        
        doc = SimpleDocTemplate(
            filepath,
            pagesize=letter,
            leftMargin=40,
            rightMargin=40,
            topMargin=55,
            bottomMargin=55
        )

        styles = getSampleStyleSheet()
        
        # Custom Typography Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0f172a')
        )

        subtitle_style = ParagraphStyle(
            'DocSubTitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569')
        )

        section_title = ParagraphStyle(
            'SectionTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#0f172a'),
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'BodyDark',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor('#334155')
        )

        table_header = ParagraphStyle(
            'TableHead',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#ffffff')
        )

        table_cell = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#1e293b')
        )

        table_cell_bold = ParagraphStyle(
            'TableCellBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#0f172a')
        )

        elements = []
        report_id = f"REP-{uuid.uuid4().hex[:8].upper()}"
        gen_time = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')

        # 1. Header Title & Banner
        elements.append(Paragraph("🛡️ NetShield AI Executive SOC Report", title_style))
        elements.append(Paragraph("Comprehensive Security Operations Telemetry, Threat Classification & Mitigation Advisory", subtitle_style))
        elements.append(Spacer(1, 10))

        # Metadata Table Box
        meta_data = [
            [
                Paragraph(f"<b>Report ID:</b> {report_id}", body_style),
                Paragraph(f"<b>Generated:</b> {gen_time}", body_style),
                Paragraph("<b>Scope:</b> Live SOC Telemetry (7-Days)", body_style),
                Paragraph("<b>Status:</b> ACTIVE THREAT MONITORING", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[130, 150, 140, 112])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BORDER', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 14))

        # 2. Executive Summary Metrics Grid
        analytics_data = self.analytics.get_detailed_analytics(days=7)
        kpis = analytics_data.get('kpis', {})
        
        tot_alerts = kpis.get('total_alerts', 0)
        crit_alerts = kpis.get('critical_alerts', 0)
        open_inc = kpis.get('open_incidents', 0)
        res_rate = kpis.get('alert_resolution_rate', 0.0)

        metrics_cells = [
            [
                Paragraph("<font size=7 color='#64748b'>TOTAL ALERTS</font><br/><font size=16 color='#0f172a'><b>{}</b></font>".format(tot_alerts), body_style),
                Paragraph("<font size=7 color='#dc2626'>CRITICAL THREATS</font><br/><font size=16 color='#dc2626'><b>{}</b></font>".format(crit_alerts), body_style),
                Paragraph("<font size=7 color='#ea580c'>ACTIVE INCIDENTS</font><br/><font size=16 color='#ea580c'><b>{}</b></font>".format(open_inc), body_style),
                Paragraph("<font size=7 color='#16a34a'>TRIAGE RESOLUTION</font><br/><font size=16 color='#16a34a'><b>{}%</b></font>".format(res_rate), body_style)
            ]
        ]
        kpi_table = Table(metrics_cells, colWidths=[133, 133, 133, 133])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#f1f5f9')),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#fef2f2')),
            ('BACKGROUND', (2, 0), (2, 0), colors.HexColor('#fff7ed')),
            ('BACKGROUND', (3, 0), (3, 0), colors.HexColor('#f0fdf4')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))
        elements.append(kpi_table)
        elements.append(Spacer(1, 14))

        # 3. Attack Vector & Threat Classification Distribution
        elements.append(Paragraph("1. Attack Vector & Classification Distribution", section_title))
        attack_dist = analytics_data.get('attack_distribution', [])
        
        cat_table_data = [[
            Paragraph("Attack Vector", table_header),
            Paragraph("Alert Count", table_header),
            Paragraph("Volume Share", table_header),
            Paragraph("Risk Severity Level", table_header)
        ]]
        
        for item in attack_dist[:6]:
            vector_name = item.get('name') or item.get('type') or 'Unknown'
            count_val = item.get('count', 0)
            pct_val = item.get('percentage', 0.0)
            sev_label = "CRITICAL" if count_val > 5 else ("HIGH" if count_val > 2 else "MEDIUM")
            sev_color = "#dc2626" if sev_label == "CRITICAL" else ("#ea580c" if sev_label == "HIGH" else "#ca8a04")
            cat_table_data.append([
                Paragraph(f"<b>{vector_name}</b>", table_cell_bold),
                Paragraph(str(count_val), table_cell),
                Paragraph(f"{pct_val}%", table_cell),
                Paragraph(f"<font color='{sev_color}'><b>{sev_label}</b></font>", table_cell)
            ])
            
        if len(cat_table_data) == 1:
            cat_table_data.append([Paragraph("No threats recorded in lookback window.", table_cell), "-", "-", "-"])

        cat_table = Table(cat_table_data, colWidths=[150, 110, 120, 152])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(cat_table)
        elements.append(Spacer(1, 14))

        # 4. Recent Security Alerts (Top 8)
        elements.append(Paragraph("2. Recent High-Severity Security Alerts Telemetry", section_title))
        recent_alerts = self.db.query(Alert).order_by(Alert.timestamp.desc()).limit(8).all()
        
        alerts_table_data = [[
            Paragraph("Alert ID", table_header),
            Paragraph("Timestamp (UTC)", table_header),
            Paragraph("Threat Signature", table_header),
            Paragraph("Source -> Dest IP", table_header),
            Paragraph("Risk Score", table_header),
            Paragraph("Status", table_header)
        ]]

        for a in recent_alerts:
            ts_str = a.timestamp.strftime('%Y-%m-%d %H:%M:%S') if a.timestamp else "N/A"
            sev_color = "#dc2626" if a.severity == "Critical" else ("#ea580c" if a.severity == "High" else "#ca8a04")
            alerts_table_data.append([
                Paragraph(f"<b>{a.alert_id}</b>", table_cell_bold),
                Paragraph(ts_str, table_cell),
                Paragraph(f"<font color='{sev_color}'><b>{a.attack_type}</b></font>", table_cell),
                Paragraph(f"{a.src_ip} &rarr; {a.dst_ip}", table_cell),
                Paragraph(f"<b>{a.risk_score:.1f}/100</b>", table_cell),
                Paragraph(a.status, table_cell)
            ])

        if len(alerts_table_data) == 1:
            alerts_table_data.append([Paragraph("No security alerts ingested.", table_cell), "-", "-", "-", "-", "-"])

        alerts_table = Table(alerts_table_data, colWidths=[80, 105, 95, 132, 60, 60])
        alerts_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(alerts_table)
        elements.append(Spacer(1, 14))

        # 5. Active SOC Incidents Backlog
        elements.append(Paragraph("3. Active Incident Escalations & Triage Queue", section_title))
        incidents = self.db.query(Incident).order_by(Incident.created_at.desc()).limit(5).all()

        inc_table_data = [[
            Paragraph("Incident ID", table_header),
            Paragraph("Priority", table_header),
            Paragraph("Status", table_header),
            Paragraph("Created Date", table_header),
            Paragraph("Resolution Notes / Analyst Assessment", table_header)
        ]]

        for i in incidents:
            c_str = i.created_at.strftime('%Y-%m-%d %H:%M') if i.created_at else "N/A"
            p_color = "#dc2626" if i.priority == "Critical" else "#ea580c"
            inc_table_data.append([
                Paragraph(f"<b>{i.incident_id[:12]}...</b>", table_cell_bold),
                Paragraph(f"<font color='{p_color}'><b>{i.priority}</b></font>", table_cell),
                Paragraph(i.status, table_cell),
                Paragraph(c_str, table_cell),
                Paragraph(i.resolution_notes or "Under SOC Investigation", table_cell)
            ])

        if len(inc_table_data) == 1:
            inc_table_data.append([Paragraph("No active incidents found.", table_cell), "-", "-", "-", "-"])

        inc_table = Table(inc_table_data, colWidths=[90, 65, 75, 80, 222])
        inc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(inc_table)
        elements.append(Spacer(1, 14))

        # 6. Recommended MITRE ATT&CK Containment Actions
        elements.append(Paragraph("4. Recommended SOC Mitigation & Containment Guidelines", section_title))
        
        mitigation_data = [
            [Paragraph("Threat Vector", table_header), Paragraph("MITRE ATT&CK Matrix", table_header), Paragraph("Recommended Defense Containment Action", table_header)],
            [
                Paragraph("<b>Denial of Service (DoS)</b>", table_cell_bold),
                Paragraph("T1498 (Network DoS)", table_cell),
                Paragraph("Apply rate-limiting on gateway firewalls, enforce SYN cookies, and block offending source IP subnets.", body_style)
            ],
            [
                Paragraph("<b>Port Scanning / Recon</b>", table_cell_bold),
                Paragraph("T1046 (Network Service Discovery)", table_cell),
                Paragraph("Block host scanning IP at edge firewall, disable unused ports, and restrict ICMP echo responses.", body_style)
            ],
            [
                Paragraph("<b>Brute Force Attempt</b>", table_cell_bold),
                Paragraph("T1110 (Brute Force)", table_cell),
                Paragraph("Enable multi-factor authentication (MFA), trigger account lockout policies, and ban IP via fail2ban.", body_style)
            ]
        ]
        
        mit_table = Table(mitigation_data, colWidths=[130, 130, 272])
        mit_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(mit_table)

        # Build document with NumberedCanvas
        doc.build(elements, canvasmaker=NumberedCanvas)
        
        self._record_history('Daily Executive Summary', 'PDF', filepath)
        return filepath

    def generate_alerts_csv(self) -> str:
        filename = f"alerts_export_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(self.reports_dir, filename)
        alerts = self.db.query(Alert).order_by(Alert.timestamp.desc()).limit(1000).all()
        
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Alert ID', 'Timestamp', 'Source IP', 'Destination IP', 'Attack Type', 'Risk Score', 'Severity', 'Status'])
            for a in alerts:
                writer.writerow([a.alert_id, a.timestamp, a.src_ip, a.dst_ip, a.attack_type, a.risk_score, a.severity, a.status])
                
        self._record_history('Alerts Export', 'CSV', filepath)
        return filepath

    def _record_history(self, report_type: str, format: str, filepath: str):
        record = ReportHistory(
            report_type=report_type,
            format=format,
            generated_by=self.user_id,
            file_path=filepath
        )
        self.db.add(record)
        self.db.commit()

