import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const ThreatOverview = ({ threatData }) => {
  if (!threatData) return null;

  const { system_risk_score, system_severity, active_flows_count, active_threats_count } = threatData;

  const getSeverityColors = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
      default: return 'bg-green-500/10 text-green-500 border-green-500';
    }
  };

  const getIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <ShieldAlert className="h-10 w-10 text-red-500" />;
      case 'high': return <AlertTriangle className="h-10 w-10 text-orange-500" />;
      case 'medium': return <Zap className="h-10 w-10 text-yellow-500" />;
      default: return <ShieldCheck className="h-10 w-10 text-green-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className={`col-span-1 md:col-span-2 rounded-2xl border p-6 flex items-center justify-between transition-colors duration-300 ${getSeverityColors(system_severity)}`}>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider opacity-80 mb-1">System Risk Score</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold">{system_risk_score}</h2>
            <span className="text-lg opacity-80">/ 100</span>
          </div>
          <p className="text-lg mt-2 font-semibold capitalize">{system_severity} Severity</p>
        </div>
        {getIcon(system_severity)}
      </div>

      <div className="col-span-1 bg-cyber-card border border-cyber-border rounded-2xl p-6 flex flex-col justify-center">
        <p className="text-sm font-medium text-cyber-muted uppercase tracking-wider mb-1">Active AI Flows</p>
        <h3 className="text-3xl font-bold text-white">{active_flows_count}</h3>
      </div>

      <div className="col-span-1 bg-cyber-card border border-cyber-border rounded-2xl p-6 flex flex-col justify-center">
        <p className="text-sm font-medium text-cyber-muted uppercase tracking-wider mb-1">Active Threats</p>
        <h3 className="text-3xl font-bold text-cyber-danger">{active_threats_count}</h3>
      </div>
    </div>
  );
};

export default ThreatOverview;
