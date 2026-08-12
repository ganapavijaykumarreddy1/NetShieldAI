import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  CheckCircle2, 
  Cpu, 
  Database, 
  HardDrive, 
  Gauge, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Server,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

const ValidationHealth = () => {
  const [aiMetrics, setAiMetrics] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, healthRes] = await Promise.all([
        api.get('/validation/ai-metrics'),
        api.get('/validation/system-health')
      ]);
      setAiMetrics(metricsRes.data);
      setHealthData(healthRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load validation & health data:', err);
      setError('Could not fetch validation & system performance metrics.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Loading AI Model Metrics & System Performance...</p>
      </div>
    );
  }

  const { overall_metrics, classes, confusion_matrix, classification_report, roc_curve, model_metadata } = aiMetrics || {};
  const { resource_usage, packet_engine, latency_metrics_ms } = healthData || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Milestone 4 Verification
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2 tracking-tight">AI Validation & System Health Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Empirical accuracy metrics, confusion matrices, latency benchmarks, and live system performance monitors.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" /> Refresh Health Telemetry
        </button>
      </div>

      {/* Top AI Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Model Accuracy', val: `${(overall_metrics?.accuracy * 100).toFixed(2)}%`, sub: 'Held-out CICIDS2017', color: 'emerald' },
          { label: 'Precision (Macro)', val: `${(overall_metrics?.precision * 100).toFixed(2)}%`, sub: 'Low False Positive', color: 'indigo' },
          { label: 'Recall (Macro)', val: `${(overall_metrics?.recall * 100).toFixed(2)}%`, sub: 'Threat Detection Rate', color: 'amber' },
          { label: 'F1 Score', val: `${(overall_metrics?.f1_score * 100).toFixed(2)}%`, sub: 'Harmonic Mean', color: 'purple' },
          { label: 'ROC-AUC Score', val: `${overall_metrics?.roc_auc}`, sub: 'Classification Power', color: 'blue' }
        ].map((card, idx) => (
          <div key={idx} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{card.label}</div>
            <div className="text-2xl font-black text-white mt-2 font-mono">{card.val}</div>
            <div className="text-[11px] text-slate-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Latency & System Throughput Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latency Gauges */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> System Processing Latency Breakdown (ms)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {[
              { name: 'Feature Extraction', ms: latency_metrics_ms?.feature_extraction_ms, desc: 'Canonical 78 features' },
              { name: 'AI Inference', ms: latency_metrics_ms?.model_inference_ms, desc: 'Random Forest Predict' },
              { name: 'Risk Score Calc', ms: latency_metrics_ms?.risk_score_calc_ms, desc: 'Severity heuristic' },
              { name: 'Alert Generation', ms: latency_metrics_ms?.alert_creation_ms, desc: 'Database write' },
              { name: 'Gmail Dispatch', ms: latency_metrics_ms?.gmail_delivery_ms, desc: 'SMTP TLS transmission' },
              { name: 'API Response Time', ms: latency_metrics_ms?.api_response_ms, desc: 'FastAPI HTTP latency' }
            ].map((lat, i) => (
              <div key={i} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
                <div className="text-xs text-slate-400 font-medium truncate">{lat.name}</div>
                <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{lat.ms} <span className="text-xs font-normal text-slate-500">ms</span></div>
                <div className="text-[11px] text-slate-500 mt-0.5">{lat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Resources */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" /> Hardware Resources & Throughput
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>CPU Utilization</span>
                <span className="font-mono font-bold text-slate-200">{resource_usage?.cpu_usage_percent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(resource_usage?.cpu_usage_percent || 0, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>RAM Usage (RSS)</span>
                <span className="font-mono font-bold text-slate-200">{resource_usage?.memory_rss_mb} MB</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min((resource_usage?.memory_rss_mb || 0) / 10, 100)}%` }}></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Packets Processed</span>
                <div className="text-base font-bold font-mono text-slate-200 mt-1">{packet_engine?.packets_processed?.toLocaleString()}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Active Threads</span>
                <div className="text-base font-bold font-mono text-slate-200 mt-1">{resource_usage?.active_threads} Threads</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Classification Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Heatmap */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Confusion Matrix Heatmap
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-500">True \ Pred</th>
                  {classes?.map((c, i) => (
                    <th key={i} className="p-2 text-slate-400 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {confusion_matrix?.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2 text-left font-semibold text-slate-300 bg-slate-950/40">{classes[i]}</td>
                    {row.map((val, j) => {
                      const isDiagonal = i === j;
                      return (
                        <td
                          key={j}
                          className={`p-2 rounded ${
                            isDiagonal
                              ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/40'
                              : val > 0
                              ? 'bg-red-950/40 text-red-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Classification Report Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" /> Classification Report per Attack Category
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-3">Threat Class</th>
                  <th className="p-3">Precision</th>
                  <th className="p-3">Recall</th>
                  <th className="p-3">F1-Score</th>
                  <th className="p-3">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {classification_report?.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-200">{r.class}</td>
                    <td className="p-3 text-indigo-400">{(r.precision * 100).toFixed(1)}%</td>
                    <td className="p-3 text-amber-400">{(r.recall * 100).toFixed(1)}%</td>
                    <td className="p-3 text-emerald-400 font-bold">{(r.f1_score * 100).toFixed(1)}%</td>
                    <td className="p-3 text-slate-400">{r.support.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Model Metadata Footer */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" /> Algorithm: <span className="text-slate-200 font-bold">{model_metadata?.algorithm}</span>
        </div>
        <div>Feature Count: <span className="text-indigo-400 font-bold">{model_metadata?.feature_count} Canonical Metrics</span></div>
        <div>Scaler: <span className="text-slate-200">{model_metadata?.scaler}</span></div>
        <div>Training Benchmark: <span className="text-slate-200">{model_metadata?.training_dataset}</span></div>
      </div>
    </div>
  );
};

export default ValidationHealth;
