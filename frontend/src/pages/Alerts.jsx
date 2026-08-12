import React, { useEffect, useState } from 'react';
import { 
  getAlerts, acknowledgeAlert, createIncident, sendAlertEmail, 
  sendTestEmail, getSmtpSettings, updateSmtpSettings 
} from '../services/socApi';
import { 
  AlertTriangle, ShieldAlert, CheckCircle, Mail, Send, Settings, 
  RefreshCw, Search, Filter, Check, X, Shield, ArrowUpRight, Lock, 
  AlertOctagon, ExternalLink, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '../utils/dateUtils';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Email / SMTP Modal State
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('netshield_smtp_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      smtp_server: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_sender_email: '',
      smtp_app_password: '',
      smtp_recipient_email: '',
      is_configured: false,
      password_set: false
    };
  });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);

  // Escalation Modal State
  const [escalateAlert, setEscalateAlert] = useState(null);
  const [escalatePriority, setEscalatePriority] = useState('High');
  const [escalateNotes, setEscalateNotes] = useState('');
  const [escalateSaving, setEscalateSaving] = useState(false);

  // Email Sending Per-Alert State
  const [sendingAlertEmailId, setSendingAlertEmailId] = useState(null);

  // Selected Alert for Details Modal
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
    fetchSmtpSettings();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const fetchSmtpSettings = async () => {
    try {
      const res = await getSmtpSettings();
      setSmtpConfig(prev => {
        const merged = {
          ...prev,
          ...res,
          smtp_sender_email: res.smtp_sender_email || prev.smtp_sender_email || '',
          smtp_recipient_email: res.smtp_recipient_email || prev.smtp_recipient_email || ''
        };
        try {
          localStorage.setItem('netshield_smtp_config', JSON.stringify(merged));
        } catch (e) {}
        return merged;
      });
    } catch (err) {
      console.error("Could not fetch SMTP settings", err);
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    setSmtpSaving(true);
    try {
      await updateSmtpSettings({
        smtp_server: smtpConfig.smtp_server,
        smtp_port: parseInt(smtpConfig.smtp_port) || 587,
        smtp_sender_email: smtpConfig.smtp_sender_email,
        smtp_app_password: smtpConfig.smtp_app_password || undefined,
        smtp_recipient_email: smtpConfig.smtp_recipient_email
      });
      try {
        localStorage.setItem('netshield_smtp_config', JSON.stringify(smtpConfig));
      } catch (e) {}
      toast.success("SMTP Email configuration updated!");
      fetchSmtpSettings();
      setShowSmtpModal(false);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update SMTP: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!smtpConfig.smtp_recipient_email && !smtpConfig.smtp_sender_email) {
      toast.error("Please enter a recipient email address first.");
      return;
    }
    setTestEmailSending(true);
    try {
      const res = await sendTestEmail(smtpConfig.smtp_recipient_email || smtpConfig.smtp_sender_email);
      toast.success(res.message || "Test email dispatched successfully!");
    } catch (err) {
      console.error(err);
      toast.error(`Email dispatch failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setTestEmailSending(false);
    }
  };

  const handleAck = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      toast.success(`Alert ${alertId} Acknowledged`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ack: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleOpenEscalate = (alert) => {
    setEscalateAlert(alert);
    setEscalatePriority(alert.severity === 'Critical' ? 'Critical' : 'High');
    setEscalateNotes(`Escalated from Alert ${alert.alert_id}: ${alert.attack_type} detected on ${alert.src_ip} -> ${alert.dst_ip}`);
  };

  const handleConfirmEscalate = async (e) => {
    e.preventDefault();
    if (!escalateAlert) return;
    setEscalateSaving(true);
    try {
      await createIncident({
        alert_id: escalateAlert.alert_id,
        priority: escalatePriority,
        resolution_notes: escalateNotes
      });

      try {
        await sendAlertEmail(escalateAlert.alert_id);
        toast.success(`Incident Ticket & Email Alert Dispatched for ${escalateAlert.alert_id}!`);
      } catch (emailErr) {
        toast.success(`Incident Ticket Created for Alert ${escalateAlert.alert_id}!`);
      }

      setEscalateAlert(null);
      fetchAlerts();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to escalate: ${err.response?.data?.detail || err.message}`);
    } finally {
      setEscalateSaving(false);
    }
  };

  const handleSendSingleAlertEmail = async (alertId) => {
    setSendingAlertEmailId(alertId);
    try {
      const res = await sendAlertEmail(alertId);
      toast.success(`Threat advisory dispatched to ${smtpConfig.smtp_recipient_email || 'SOC Team'}`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to send email: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSendingAlertEmailId(null);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'All' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'All' && a.status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchIp = a.src_ip?.toLowerCase().includes(term) || a.dst_ip?.toLowerCase().includes(term);
      const matchType = a.attack_type?.toLowerCase().includes(term);
      const matchId = a.alert_id?.toLowerCase().includes(term);
      return matchIp || matchType || matchId;
    }
    return true;
  });

  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const newCount = alerts.filter(a => a.status === 'New').length;
  const ackedCount = alerts.filter(a => a.status === 'Acknowledged').length;

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyber-border/50">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyber-danger/10 border border-cyber-danger/30 rounded-lg text-cyber-danger">
                <AlertOctagon className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                  Alert Management &amp; Notification Dispatch
                </h1>
                <p className="text-xs md:text-sm text-cyber-muted">
                  Triaging, SMTP Email Broadcasts, MITRE ATT&amp;CK Containment, and Incident Escalations
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SMTP Settings Button */}
            <button
              onClick={() => setShowSmtpModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-cyber-card border border-cyber-border hover:border-cyber-accent rounded-lg text-xs font-semibold text-white transition-all shadow-sm"
            >
              <Mail className="h-4 w-4 text-cyber-accent" />
              <span>Email Alerts / SMTP</span>
              <span className={`w-2 h-2 rounded-full ${smtpConfig.is_configured ? 'bg-cyber-success shadow-[0_0_8px_#10b981]' : 'bg-yellow-500'}`} />
            </button>

            {/* Quick Test Email Button */}
            <button
              onClick={handleSendTestEmail}
              disabled={testEmailSending}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyber-card border border-cyber-border hover:border-cyber-accent rounded-lg text-xs font-semibold text-cyber-muted hover:text-white transition-all"
              title="Send a sample alert notification"
            >
              <Send className={`h-3.5 w-3.5 text-cyber-accent ${testEmailSending ? 'animate-spin' : ''}`} />
              {testEmailSending ? 'Sending...' : 'Test Mail'}
            </button>

            {/* Refresh */}
            <button
              onClick={fetchAlerts}
              className="p-2 bg-cyber-card border border-cyber-border hover:border-cyber-accent/50 rounded-lg text-cyber-muted hover:text-white transition-all"
              title="Refresh alerts"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyber-accent' : ''}`} />
            </button>
          </div>
        </header>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
            <span className="text-xs text-cyber-muted uppercase font-bold">Total Ingested</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{alerts.length}</p>
          </div>
          <div className="bg-cyber-card border border-cyber-danger/40 p-4 rounded-xl">
            <span className="text-xs text-cyber-danger uppercase font-bold">Critical Threats</span>
            <p className="text-2xl font-bold font-mono text-cyber-danger mt-1">{criticalCount}</p>
          </div>
          <div className="bg-cyber-card border border-cyber-border p-4 rounded-xl">
            <span className="text-xs text-yellow-400 uppercase font-bold">Pending Triage</span>
            <p className="text-2xl font-bold font-mono text-yellow-400 mt-1">{newCount}</p>
          </div>
          <div className="bg-cyber-card border border-cyber-success/40 p-4 rounded-xl">
            <span className="text-xs text-cyber-success uppercase font-bold">Acknowledged</span>
            <p className="text-2xl font-bold font-mono text-cyber-success mt-1">{ackedCount}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-cyber-card border border-cyber-border p-3.5 rounded-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyber-muted" />
            <input 
              type="text"
              placeholder="Search by IP, Attack Type, or Alert ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-cyber-bg border border-cyber-border/70 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-cyber-muted focus:outline-none focus:border-cyber-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyber-muted" />
            <select 
              value={filterSeverity} 
              onChange={e => setFilterSeverity(e.target.value)}
              className="bg-cyber-bg border border-cyber-border text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyber-accent"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-cyber-bg border border-cyber-border text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyber-accent"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
            </select>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-cyber-bg/80 border-b border-cyber-border text-cyber-muted text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Alert ID</th>
                  <th className="px-4">Threat Signature</th>
                  <th className="px-4">Source &rarr; Dest IP</th>
                  <th className="px-4">Risk &bull; Conf</th>
                  <th className="px-4">Severity</th>
                  <th className="px-4">Status</th>
                  <th className="px-4 text-right">SOC Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/40">
                {filteredAlerts.map(a => {
                  const isCritical = a.severity === 'Critical';
                  const isHigh = a.severity === 'High';
                  const isAcked = a.status === 'Acknowledged';

                  return (
                    <tr 
                      key={a.id} 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedAlert(a)}
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-cyber-accent font-semibold">
                        {a.alert_id}
                      </td>
                      <td className="px-4">
                        <div className="font-semibold text-white">{a.attack_type}</div>
                        <div className="text-[11px] text-cyber-muted font-mono">{a.protocol || 'TCP'} &bull; {formatDateTime(a.timestamp)}</div>
                      </td>
                      <td className="px-4 font-mono text-xs text-cyber-muted">
                        <span className="text-white font-medium">{a.src_ip}</span>
                        <span className="text-cyber-muted mx-1.5">&rarr;</span>
                        <span>{a.dst_ip}</span>
                      </td>
                      <td className="px-4 font-mono text-xs">
                        <span className="text-white font-bold">{a.risk_score?.toFixed(1) || 0}/100</span>
                        <span className="text-cyber-muted ml-1 text-[11px]">({((a.confidence || 0) * 100).toFixed(0)}%)</span>
                      </td>
                      <td className="px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isCritical ? 'bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/40' :
                          isHigh ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isAcked ? 'bg-cyber-success/20 text-cyber-success' : 'bg-cyber-danger/20 text-cyber-danger'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send Email */}
                          <button
                            onClick={() => handleSendSingleAlertEmail(a.alert_id)}
                            disabled={sendingAlertEmailId === a.alert_id}
                            className="p-1.5 bg-cyber-card border border-cyber-border hover:border-cyber-accent text-cyber-accent rounded text-xs transition-all"
                            title="Dispatch Email Alert"
                          >
                            <Mail className={`h-3.5 w-3.5 ${sendingAlertEmailId === a.alert_id ? 'animate-spin text-white' : ''}`} />
                          </button>

                          {/* Ack Button */}
                          {a.status === 'New' && (
                            <button 
                              onClick={() => handleAck(a.alert_id)} 
                              className="px-2.5 py-1 bg-cyber-accent text-cyber-bg rounded text-xs hover:opacity-90 font-bold transition-all shadow-sm"
                            >
                              Ack
                            </button>
                          )}

                          {/* Escalate Button */}
                          <button 
                            onClick={() => handleOpenEscalate(a)} 
                            className="px-2.5 py-1 bg-cyber-danger text-white rounded text-xs hover:opacity-90 font-bold transition-all shadow-sm"
                          >
                            Escalate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredAlerts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-cyber-muted">
                      No security alerts match the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------- SMTP Settings Modal ----------------- */}
        {showSmtpModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-cyber-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyber-accent/10 rounded-lg text-cyber-accent">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">SMTP Email Notification Dispatcher</h3>
                    <p className="text-xs text-cyber-muted">Configure outbound threat email alerts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSmtpModal(false)}
                  className="text-cyber-muted hover:text-white p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSmtp} className="p-5 space-y-4">
                <div className="p-3 bg-cyber-bg/70 border border-cyber-border rounded-lg text-xs space-y-1">
                  <p className="text-white font-semibold flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-cyber-accent" />
                    How to use Gmail SMTP:
                  </p>
                  <p className="text-cyber-muted">
                    Use your Gmail address and generate an <strong>App Password</strong> from your Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-cyber-muted">SMTP Server</label>
                    <input 
                      type="text"
                      value={smtpConfig.smtp_server || 'smtp.gmail.com'}
                      onChange={e => setSmtpConfig({ ...smtpConfig, smtp_server: e.target.value })}
                      className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-cyber-muted">Port</label>
                    <input 
                      type="number"
                      value={smtpConfig.smtp_port || 587}
                      onChange={e => setSmtpConfig({ ...smtpConfig, smtp_port: e.target.value })}
                      className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-cyber-muted">Sender Email (Gmail Account)</label>
                  <input 
                    type="email"
                    placeholder="soc.netshield@gmail.com"
                    value={smtpConfig.smtp_sender_email || ''}
                    onChange={e => setSmtpConfig({ ...smtpConfig, smtp_sender_email: e.target.value })}
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-cyber-muted">Gmail App Password (16 characters)</label>
                  <input 
                    type="password"
                    placeholder={smtpConfig.password_set ? "•••••••••••••••• (Saved)" : "abcd efgh ijkl mnop"}
                    value={smtpConfig.smtp_app_password || ''}
                    onChange={e => setSmtpConfig({ ...smtpConfig, smtp_app_password: e.target.value })}
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-cyber-muted">Default Recipient (Admin / SOC Team Email)</label>
                  <input 
                    type="email"
                    placeholder="security.analyst@company.com"
                    value={smtpConfig.smtp_recipient_email || ''}
                    onChange={e => setSmtpConfig({ ...smtpConfig, smtp_recipient_email: e.target.value })}
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-accent"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-cyber-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={testEmailSending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-cyber-bg border border-cyber-border hover:border-cyber-accent text-cyber-accent rounded-lg text-xs font-semibold transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {testEmailSending ? 'Testing...' : 'Send Test Email'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSmtpModal(false)}
                      className="px-3 py-2 text-xs font-semibold text-cyber-muted hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={smtpSaving}
                      className="px-4 py-2 bg-cyber-accent text-cyber-bg rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md"
                    >
                      {smtpSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- Escalation Modal ----------------- */}
        {escalateAlert && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-cyber-border">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-cyber-danger" />
                  <h3 className="text-lg font-bold text-white">Escalate to Incident</h3>
                </div>
                <button onClick={() => setEscalateAlert(null)} className="text-cyber-muted hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmEscalate} className="p-5 space-y-4">
                <div className="text-xs text-cyber-muted">
                  Creating a formal SOC Incident for Alert <strong className="text-white">{escalateAlert.alert_id}</strong> ({escalateAlert.attack_type}).
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-cyber-muted">Incident Priority</label>
                  <select
                    value={escalatePriority}
                    onChange={e => setEscalatePriority(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyber-danger"
                  >
                    <option value="Critical">Critical - Immediate Containment</option>
                    <option value="High">High - Priority Investigation</option>
                    <option value="Medium">Medium - Standard Queue</option>
                    <option value="Low">Low - Informational Log</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-cyber-muted">Resolution / Escalation Notes</label>
                  <textarea
                    rows={3}
                    value={escalateNotes}
                    onChange={e => setEscalateNotes(e.target.value)}
                    className="w-full bg-cyber-bg border border-cyber-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyber-danger"
                    placeholder="Enter analyst escalation details..."
                  />
                </div>

                <div className="pt-3 border-t border-cyber-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEscalateAlert(null)}
                    className="px-3 py-2 text-xs font-semibold text-cyber-muted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={escalateSaving}
                    className="px-4 py-2 bg-cyber-danger text-white rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md"
                  >
                    {escalateSaving ? 'Creating Incident...' : 'Confirm Escalation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- Alert Details Modal ----------------- */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-cyber-border">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyber-accent" />
                  <h3 className="text-lg font-bold text-white">Alert Deep-Dive Telemetry</h3>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="text-cyber-muted hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-cyber-bg/70 p-3 rounded-lg border border-cyber-border">
                  <div>
                    <span className="text-cyber-muted">Alert ID:</span>
                    <p className="text-white font-mono font-bold mt-0.5">{selectedAlert.alert_id}</p>
                  </div>
                  <div>
                    <span className="text-cyber-muted">Timestamp:</span>
                    <p className="text-white font-mono mt-0.5">{formatDateTime(selectedAlert.timestamp)}</p>
                  </div>
                  <div>
                    <span className="text-cyber-muted">Threat Classification:</span>
                    <p className="text-cyber-danger font-bold mt-0.5">{selectedAlert.attack_type}</p>
                  </div>
                  <div>
                    <span className="text-cyber-muted">Severity:</span>
                    <p className="text-white font-bold mt-0.5">{selectedAlert.severity}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-cyber-bg/70 p-3 rounded-lg border border-cyber-border">
                  <div>
                    <span className="text-cyber-muted">Source IP:</span>
                    <p className="text-white font-mono font-bold mt-0.5">{selectedAlert.src_ip}</p>
                  </div>
                  <div>
                    <span className="text-cyber-muted">Destination IP:</span>
                    <p className="text-white font-mono mt-0.5">{selectedAlert.dst_ip}</p>
                  </div>
                  <div>
                    <span className="text-cyber-muted">Transport Protocol:</span>
                    <p className="text-white font-mono mt-0.5">{selectedAlert.protocol || 'TCP'}</p>
                  </div>
                  <div>
                    <span className="text-cyber-muted">Risk Score:</span>
                    <p className="text-cyber-accent font-bold mt-0.5">{selectedAlert.risk_score?.toFixed(1)}/100 ({((selectedAlert.confidence || 0) * 100).toFixed(0)}% confidence)</p>
                  </div>
                </div>

                <div className="bg-cyber-bg/70 p-3 rounded-lg border border-cyber-accent/30">
                  <span className="text-cyber-accent font-bold uppercase tracking-wider text-[10px]">Recommended SOC Mitigation</span>
                  <p className="text-white mt-1">{selectedAlert.recommended_action || 'Inspect source firewall logs and block malicious IP range.'}</p>
                </div>

                <div className="pt-3 border-t border-cyber-border flex items-center justify-between">
                  <button
                    onClick={() => {
                      handleSendSingleAlertEmail(selectedAlert.alert_id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-card border border-cyber-border hover:border-cyber-accent text-cyber-accent rounded-lg font-semibold"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Dispatch Email
                  </button>

                  <div className="flex items-center gap-2">
                    {selectedAlert.status === 'New' && (
                      <button
                        onClick={() => {
                          handleAck(selectedAlert.alert_id);
                          setSelectedAlert(null);
                        }}
                        className="px-3 py-1.5 bg-cyber-accent text-cyber-bg rounded-lg font-bold"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const target = selectedAlert;
                        setSelectedAlert(null);
                        handleOpenEscalate(target);
                      }}
                      className="px-3 py-1.5 bg-cyber-danger text-white rounded-lg font-bold"
                    >
                      Escalate Incident
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Alerts;
