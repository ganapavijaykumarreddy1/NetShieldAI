import React, { useEffect, useState } from 'react';
import { getDetailedAnalytics, generatePdfReport, generateCsvReport } from '../services/socApi';
import { 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { 
  Activity, Shield, AlertTriangle, CheckCircle2, TrendingUp, 
  Server, Cpu, RefreshCw, Download, Filter, Zap, Globe, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  acknowledged: '#10b981'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cyber-card/95 border border-cyber-border p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-white font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center gap-2 text-xs py-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-cyber-muted font-medium">{entry.name}:</span>
            <span className="text-white font-mono font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchDetailedAnalytics(days);
  }, [days]);

  const fetchDetailedAnalytics = async (selectedDays) => {
    setLoading(true);
    try {
      const res = await getDetailedAnalytics(selectedDays);
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await generatePdfReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NetShield-SOC-Report-${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Executive PDF report generated!");
    } catch (e) {
      toast.error("Failed to generate PDF report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await generateCsvReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NetShield-Alerts-Data-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Alerts CSV exported!");
    } catch (e) {
      toast.error("Failed to generate CSV export");
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = data?.kpis || {};
  const attackDist = data?.attack_distribution || [];
  const timelineData = data?.attack_timeline || [];
  const riskTrendData = data?.risk_trend || [];
  const protocolDist = data?.protocol_distribution || [];
  const topIps = data?.top_source_ips || [];

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyber-border/50">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyber-accent/10 border border-cyber-accent/30 rounded-lg text-cyber-accent">
                <Activity className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                  Security Analytics &amp; Threat Intelligence
                </h1>
                <p className="text-xs md:text-sm text-cyber-muted">
                  Continuous AI threat classification &bull; MITRE ATT&amp;CK telemetry &bull; Executive SOC Metrics
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe Selector */}
            <div className="flex items-center bg-cyber-card border border-cyber-border rounded-lg p-1">
              {[
                { label: '24 Hours', value: 1 },
                { label: '7 Days', value: 7 },
                { label: '30 Days', value: 30 }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDays(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    days === opt.value
                      ? 'bg-cyber-accent text-cyber-bg shadow-sm'
                      : 'text-cyber-muted hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchDetailedAnalytics(days)}
              className="p-2 bg-cyber-card border border-cyber-border hover:border-cyber-accent/50 rounded-lg text-cyber-muted hover:text-white transition-all"
              title="Refresh Analytics"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyber-accent' : ''}`} />
            </button>

            {/* Export Menu */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-card border border-cyber-border hover:border-cyber-accent rounded-lg text-xs font-semibold text-white transition-all shadow-sm"
              >
                <Download className="h-3.5 w-3.5 text-cyber-accent" />
                Export PDF
              </button>
              <button
                onClick={handleDownloadCsv}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyber-card border border-cyber-border hover:border-cyber-accent rounded-lg text-xs font-semibold text-white transition-all shadow-sm"
              >
                <Download className="h-3.5 w-3.5 text-cyber-success" />
                CSV
              </button>
            </div>
          </div>
        </header>

        {/* 1. KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Threat Detection Rate */}
          <div className="bg-cyber-card border border-cyber-border/70 hover:border-cyber-accent/40 rounded-xl p-5 relative overflow-hidden transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyber-muted">Detection Rate</span>
              <span className="p-2 bg-cyber-accent/10 text-cyber-accent rounded-lg">
                <Zap className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white">
                {kpis.detection_rate !== undefined ? `${kpis.detection_rate}%` : '---'}
              </span>
              <span className="text-xs text-cyber-accent bg-cyber-accent/10 px-1.5 py-0.5 rounded font-semibold">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-cyber-muted mt-2">
              Identified anomalous traffic against total inspected flows
            </p>
            <div className="w-full bg-cyber-border/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-cyber-accent h-full rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(kpis.detection_rate || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Resolution Rate */}
          <div className="bg-cyber-card border border-cyber-border/70 hover:border-cyber-success/40 rounded-xl p-5 relative overflow-hidden transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyber-muted">Alert Resolution</span>
              <span className="p-2 bg-cyber-success/10 text-cyber-success rounded-lg">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-cyber-success">
                {kpis.alert_resolution_rate !== undefined ? `${kpis.alert_resolution_rate}%` : '---'}
              </span>
              <span className="text-xs text-cyber-success bg-cyber-success/10 px-1.5 py-0.5 rounded font-semibold">
                {kpis.acknowledged_alerts || 0} / {kpis.total_alerts || 0}
              </span>
            </div>
            <p className="text-xs text-cyber-muted mt-2">
              Triage efficiency across active SOC security queues
            </p>
            <div className="w-full bg-cyber-border/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-cyber-success h-full rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(kpis.alert_resolution_rate || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Total Flow Predictions */}
          <div className="bg-cyber-card border border-cyber-border/70 hover:border-purple-500/40 rounded-xl p-5 relative overflow-hidden transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyber-muted">Inspected Flows</span>
              <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <Server className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white">
                {(kpis.total_predictions || 0).toLocaleString()}
              </span>
              <span className="text-xs text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-semibold">
                Live Sniffing
              </span>
            </div>
            <p className="text-xs text-cyber-muted mt-2">
              Packets analyzed across network interfaces
            </p>
            <div className="w-full bg-cyber-border/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full w-4/5" />
            </div>
          </div>

          {/* Open Incidents / False Positives */}
          <div className="bg-cyber-card border border-cyber-danger/30 hover:border-cyber-danger/60 rounded-xl p-5 relative overflow-hidden transition-all shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyber-muted">Incident Backlog</span>
              <span className="p-2 bg-cyber-danger/10 text-cyber-danger rounded-lg">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-cyber-danger">
                {kpis.open_incidents || 0}
              </span>
              <span className="text-xs text-cyber-muted">
                Active &bull; {kpis.resolved_incidents || 0} Resolved
              </span>
            </div>
            <p className="text-xs text-cyber-muted mt-2">
              High severity escalations assigned for containment
            </p>
            <div className="w-full bg-cyber-border/50 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-cyber-danger h-full rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(((kpis.open_incidents || 0) / Math.max(kpis.total_alerts || 1, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>

        </div>

        {/* 2. Visual Charts Row 1: Attack Distribution with Explicit Color Labels & Threat Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Attack Distribution with Detailed Color Legend */}
          <div className="lg:col-span-5 bg-cyber-card border border-cyber-border rounded-xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyber-accent" />
                    Attack Category Breakdown
                  </h3>
                  <p className="text-xs text-cyber-muted">Classified attack vector proportion with explicit color mapping</p>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="h-52 relative flex items-center justify-center">
                {attackDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attackDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="name"
                      >
                        {attackDist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#0c0e14" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-cyber-muted text-xs">No threats recorded in this timeframe</div>
                )}
              </div>
            </div>

            {/* Explicit Color Labels & Legend List */}
            <div className="mt-4 pt-4 border-t border-cyber-border/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-muted mb-3 flex items-center justify-between">
                <span>Threat Category Legend</span>
                <span>Events (%)</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {attackDist.map((item, idx) => (
                  <div 
                    key={`legend-${idx}`}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-cyber-bg/60 border border-cyber-border/40 hover:border-cyber-border transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3.5 h-3.5 rounded shadow-sm flex-shrink-0" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span className="font-semibold text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-cyber-muted">{item.count} alerts</span>
                      <span 
                        className="font-mono font-bold px-2 py-0.5 rounded text-[11px]"
                        style={{ 
                          backgroundColor: `${item.color}22`,
                          color: item.color,
                          border: `1px solid ${item.color}44`
                        }}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
                {attackDist.length === 0 && (
                  <div className="text-xs text-cyber-muted text-center py-2">No active categories</div>
                )}
              </div>
            </div>
          </div>

          {/* Attack Timeline Multi-Severity Stacked Area */}
          <div className="lg:col-span-7 bg-cyber-card border border-cyber-border rounded-xl p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-cyber-danger" />
                    Threat Velocity &amp; Severity Timeline
                  </h3>
                  <p className="text-xs text-cyber-muted">Multi-day historical volume decomposed by severity index</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-danger" />
                    <span className="text-cyber-muted">Critical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-cyber-muted">High</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-accent" />
                    <span className="text-cyber-muted">Total</span>
                  </div>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 11}} />
                    <YAxis stroke="#9ca3af" tick={{fontSize: 11}} allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" name="Total Alerts" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                    <Area type="monotone" dataKey="critical" name="Critical Events" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCritical)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-cyber-border/60 text-center">
              <div className="bg-cyber-bg/40 p-2 rounded">
                <span className="text-[10px] text-cyber-muted uppercase">Avg Daily Alerts</span>
                <p className="text-sm font-mono font-bold text-white">
                  {(timelineData.reduce((acc, d) => acc + (d.count || 0), 0) / Math.max(timelineData.length, 1)).toFixed(1)}
                </p>
              </div>
              <div className="bg-cyber-bg/40 p-2 rounded">
                <span className="text-[10px] text-cyber-muted uppercase">Peak Critical Day</span>
                <p className="text-sm font-mono font-bold text-cyber-danger">
                  {Math.max(...timelineData.map(d => d.critical || 0), 0)} events
                </p>
              </div>
              <div className="bg-cyber-bg/40 p-2 rounded">
                <span className="text-[10px] text-cyber-muted uppercase">Trend Trajectory</span>
                <p className="text-sm font-mono font-bold text-cyber-success">Stable / Monitored</p>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Visual Charts Row 2: Protocol Breakdown with Color Badges & 7-Day Risk Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Protocol Distribution with Color Labels */}
          <div className="lg:col-span-5 bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-400" />
                  Network Protocol Telemetry
                </h3>
                <p className="text-xs text-cyber-muted">Transport layer distribution with designated color indicators</p>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={protocolDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" stroke="#9ca3af" tick={{fontSize: 10}} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" tick={{fontSize: 11}} width={50} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Flow Count" radius={[0, 4, 4, 0]}>
                    {protocolDist.map((entry, index) => (
                      <Cell key={`cell-proto-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Protocol Legend with Colors */}
            <div className="mt-4 pt-3 border-t border-cyber-border/60">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {protocolDist.map((p, idx) => (
                  <div key={`proto-pill-${idx}`} className="flex items-center gap-2 p-1.5 bg-cyber-bg/50 border border-cyber-border/30 rounded">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-xs font-mono text-white uppercase font-semibold">{p.name}:</span>
                    <span className="text-xs font-mono text-cyber-muted">{p.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Score Index Trend (7 Days) */}
          <div className="lg:col-span-7 bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-400" />
                  Threat Risk Index &amp; Peak Variance
                </h3>
                <p className="text-xs text-cyber-muted">Rolling average risk vs highest severity anomaly per timeframe</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-danger" />
                  <span className="text-cyber-muted">Max Risk (Peak)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-accent" />
                  <span className="text-cyber-muted">Avg Risk</span>
                </div>
              </div>
            </div>

            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 11}} />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" tick={{fontSize: 11}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="max_risk" name="Peak Risk Score" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 3 }} />
                  <Line type="monotone" dataKey="avg_risk" name="Average Risk Score" stroke="#00f0ff" strokeWidth={2} strokeDasharray="4 4" dot={{ fill: '#00f0ff', r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* 4. Top Malicious Source IPs Table */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyber-accent" />
                Top Adversary Endpoints &amp; Source IPs
              </h3>
              <p className="text-xs text-cyber-muted">High frequency offensive nodes flagged across detection logs</p>
            </div>
            <span className="text-xs font-mono text-cyber-muted">{topIps.length} malicious endpoints tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-cyber-border text-cyber-muted text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-3">Adversary Source IP</th>
                  <th className="px-3">Recorded Threat Count</th>
                  <th className="px-3">Threat Volume Proportion</th>
                  <th className="px-3 text-right">Defense Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/40">
                {topIps.map((entry, idx) => {
                  const maxCount = Math.max(...topIps.map(i => i.count || 1), 1);
                  const pct = Math.round((entry.count / maxCount) * 100);
                  return (
                    <tr key={`top-ip-${idx}`} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyber-danger animate-pulse" />
                        {entry.ip}
                      </td>
                      <td className="px-3 font-mono text-cyber-danger font-semibold">
                        {entry.count} alerts
                      </td>
                      <td className="px-3">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="w-full bg-cyber-border/60 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-cyber-danger rounded-full" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                          <span className="text-xs font-mono text-cyber-muted">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-3 text-right">
                        <span className="px-2.5 py-1 rounded text-xs font-bold bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/30">
                          FIREWALL FLAGGED
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {topIps.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-cyber-muted text-xs">
                      No malicious source IP clusters detected in selected window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
