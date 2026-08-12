import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Mail, 
  FileText, 
  Terminal, 
  RefreshCw, 
  Zap, 
  Activity,
  Server,
  ArrowRight,
  Database
} from 'lucide-react';
import api from '../services/api';

const DemoMode = () => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('port_scan');
  const [executionState, setExecutionState] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScenarios();
    fetchHistory();
  }, []);

  // Poll execution state when active
  useEffect(() => {
    let interval = null;
    if (executionState && executionState.status === 'running') {
      interval = setInterval(() => {
        fetchStatus();
      }, 800);
    } else if (executionState && executionState.status === 'completed') {
      fetchHistory();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [executionState]);

  const fetchScenarios = async () => {
    try {
      const res = await api.get('/demo/scenarios');
      setScenarios(res.data);
    } catch (err) {
      console.error('Failed to fetch demo scenarios:', err);
      setError('Failed to load demonstration scenarios.');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/demo/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await api.get('/demo/status');
      setExecutionState(res.data);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleRunScenario = async () => {
    setIsStarting(true);
    setError('');
    try {
      const res = await api.post('/demo/run', { scenario_id: selectedScenario });
      if (res.data.status === 'started') {
        fetchStatus();
      }
    } catch (err) {
      console.error('Error starting scenario:', err);
      setError(err.response?.data?.detail || 'Failed to launch demonstration scenario.');
    } finally {
      setIsStarting(false);
    }
  };

  const currentScenarioMeta = scenarios.find(s => s.id === selectedScenario);

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return <span className="bg-red-900/60 text-red-300 border border-red-700/50 text-xs px-2.5 py-1 rounded-full font-semibold">Critical</span>;
      case 'high':
        return <span className="bg-orange-900/60 text-orange-300 border border-orange-700/50 text-xs px-2.5 py-1 rounded-full font-semibold">High</span>;
      case 'medium':
        return <span className="bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 text-xs px-2.5 py-1 rounded-full font-semibold">Medium</span>;
      default:
        return <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs px-2.5 py-1 rounded-full font-semibold">Benign / Low</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" /> Milestone 4 Demo Engine
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-2 tracking-tight">Interactive Platform Demonstration Mode</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Simulate end-to-end cyber attack scenarios with single-click execution. Watch live traffic ingestion, AI inference classification, threat risk scoring, automated alert generation, Gmail email notifications, and SOC incident ticket escalation in real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunScenario}
              disabled={isStarting || (executionState && executionState.status === 'running')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {executionState && executionState.status === 'running' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-200" /> Running Scenario...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Execute Selected Scenario
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/40 border border-red-700/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Scenario Selection Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" /> Select Attack Demonstration Scenario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm text-slate-100">{sc.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-3 leading-relaxed">{sc.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {getSeverityBadge(sc.severity)}
                  <span className="text-[11px] text-slate-500 font-mono">~{sc.estimated_duration_sec}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Execution Stepper & Progress Panel */}
      {executionState && executionState.status !== 'idle' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">Active Run State</span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                {executionState.name}
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                  executionState.status === 'completed'
                    ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50'
                    : executionState.status === 'running'
                    ? 'bg-indigo-900/60 text-indigo-400 border border-indigo-700/50 animate-pulse'
                    : 'bg-red-900/60 text-red-400 border border-red-700/50'
                }`}>
                  {executionState.status.toUpperCase()}
                </span>
              </h3>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              Elapsed Time: <span className="text-indigo-400 font-bold">{executionState.elapsed_sec}s</span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { num: 1, name: 'Simulation' },
              { num: 2, name: 'Feature Extraction' },
              { num: 3, name: 'AI Inference' },
              { num: 4, name: 'Alert Raised' },
              { num: 5, name: 'Gmail & Incident' },
              { num: 6, name: 'Completed' }
            ].map((step) => {
              const isPassed = executionState.current_step >= step.num;
              const isCurrent = executionState.current_step === step.num && executionState.status === 'running';
              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/40 animate-pulse'
                      : isPassed
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-mono font-bold mb-0.5">Step {step.num}</div>
                  <div className="text-xs font-medium truncate">{step.name}</div>
                </div>
              );
            })}
          </div>

          {/* Action Links if Alert or Incident Generated */}
          {(executionState.generated_alert_id || executionState.generated_incident_id) && (
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-800/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">Demonstration Artifacts Generated</h4>
                  <p className="text-xs text-slate-400">Security event successfully logged into NetShield AI database engine.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {executionState.generated_alert_id && (
                  <a
                    href="/alerts"
                    className="bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs px-3.5 py-2 rounded-lg border border-slate-700 font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Alert #{executionState.generated_alert_id} <ArrowRight className="w-3 h-3" />
                  </a>
                )}
                {executionState.generated_incident_id && (
                  <a
                    href="/incidents"
                    className="bg-indigo-900/60 hover:bg-indigo-800/60 text-indigo-200 text-xs px-3.5 py-2 rounded-lg border border-indigo-700/60 font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> View Incident #{executionState.generated_incident_id} <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Console Execution Timeline */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Live Execution Stream Logs
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 max-h-64 overflow-y-auto">
              {executionState.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className="text-indigo-400 shrink-0 font-semibold">[{log.stage}]</span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Execution History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Demonstration Execution Session History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Scenario</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Alert ID</th>
                  <th className="p-3">Incident ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-400">{h.timestamp}</td>
                    <td className="p-3 font-semibold text-slate-200">{h.name}</td>
                    <td className="p-3">
                      <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono">
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono">{h.duration_sec}s</td>
                    <td className="p-3 font-mono text-indigo-400">{h.alert_id ? `#${h.alert_id}` : '-'}</td>
                    <td className="p-3 font-mono text-amber-400">{h.incident_id ? `#${h.incident_id}` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoMode;
