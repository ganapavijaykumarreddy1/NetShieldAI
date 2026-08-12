import React, { useEffect, useState, useRef } from 'react';
import { getNetworkStatistics, getRecentPackets, getThreatFeed } from '../services/networkApi';
import api from '../services/api';
import NetworkOverview from '../components/network/NetworkOverview';
import ProtocolDistribution from '../components/network/ProtocolDistribution';
import RecentPacketFeed from '../components/network/RecentPacketFeed';
import TopEndpoints from '../components/network/TopEndpoints';
import ThreatOverview from '../components/network/ThreatOverview';
import ThreatFeed from '../components/network/ThreatFeed';
import { ShieldAlert, Zap, Gauge, Play, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [packets, setPackets] = useState([]);
  const [threats, setThreats] = useState(null);
  const [error, setError] = useState(null);
  const prevThreatCountRef = useRef(null);

  // Demo Widget State
  const [selectedScenario, setSelectedScenario] = useState('port_scan');
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStatus, setDemoStatus] = useState(null);

  const roleName = user?.role?.role_name || 'Security Analyst';
  const isSocManager = roleName === 'SOC Manager' || roleName === 'Administrator';

  const fetchData = async () => {
    try {
      const [statsData, packetsData, threatsData] = await Promise.all([
        getNetworkStatistics(),
        getRecentPackets(),
        getThreatFeed().catch(() => null)
      ]);
      
      setStats(statsData);
      setPackets(packetsData);
      if (threatsData) setThreats(threatsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch network data:", err);
      setError("Unable to connect to Network Monitoring Engine.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        prevThreatCountRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Demo Polling Effect
  useEffect(() => {
    let demoInterval = null;
    if (demoRunning) {
      demoInterval = setInterval(async () => {
        try {
          const res = await api.get('/demo/status');
          setDemoStatus(res.data);
          // Rapidly re-fetch dashboard stats so graphs and threat counters update live
          fetchData();

          if (res.data?.status === 'completed' || res.data?.status === 'failed') {
            setDemoRunning(false);
            if (res.data?.status === 'completed') {
              toast.success(`Demo Attack Completed! Alert #${res.data?.generated_alert_id || ''} created.`);
            } else {
              toast.error('Demo execution failed.');
            }
          }
        } catch (e) {
          console.error("Error checking demo status:", e);
        }
      }, 800);
    }
    return () => {
      if (demoInterval) clearInterval(demoInterval);
    };
  }, [demoRunning]);

  const handleStartDemo = async () => {
    try {
      setDemoRunning(true);
      setDemoStatus(null);
      await api.post('/demo/run', { scenario_id: selectedScenario });
      toast.success("Demo attack initiated! Watching live network packet response...");
    } catch (err) {
      setDemoRunning(false);
      const msg = err.response?.data?.detail || "Failed to start demo scenario.";
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (threats && threats.active_threats_count > 0) {
      if (prevThreatCountRef.current !== null && threats.active_threats_count > prevThreatCountRef.current) {
        const latestThreat = threats.recent_threats[0];
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-in fade-in zoom-in-95 duration-200' : 'animate-out fade-out zoom-out-95 duration-150'
            } max-w-sm w-full bg-slate-900 border border-red-500/70 shadow-2xl rounded-xl pointer-events-auto flex items-start p-3.5 gap-3 text-white`}
          >
            <div className="p-2 bg-red-950/80 border border-red-700/60 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Threat Detected!</p>
              <p className="text-xs font-mono font-semibold text-slate-200 mt-0.5 truncate">
                {latestThreat.prediction.threat_type} from {latestThreat.flow_key.split(' -> ')[0]}
              </p>
            </div>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ), { duration: 6000 });
      }
      prevThreatCountRef.current = threats.active_threats_count;
    } else if (threats && threats.active_threats_count === 0) {
      prevThreatCountRef.current = 0;
    }
  }, [threats]);

  const currentStep = demoStatus?.current_step || 0;
  const lastLog = demoStatus?.logs?.[demoStatus.logs.length - 1];

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-cyber-border/40 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-cyber-accent h-7 w-7" />
              Network Traffic Analytics
            </h1>
            <p className="text-xs md:text-sm text-cyber-muted mt-1">Real-time AI packet monitoring, flow extraction, and threat telemetry console.</p>
          </div>

          {roleName === 'Administrator' && (
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 border border-cyber-border/80 p-2 rounded-xl shadow-xl">
              <div className="flex items-center gap-2 pl-2">
                <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider hidden sm:inline">Attack Demo:</span>
              </div>

              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                disabled={demoRunning}
                className="bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="port_scan">Reconnaissance Port Scan</option>
                <option value="ddos_attack">DDoS Flood Attack</option>
                <option value="brute_force">SSH Brute Force</option>
                <option value="web_attack">Web Attack (SQLi / XSS)</option>
                <option value="botnet_attack">Botnet C2 Beaconing</option>
                <option value="mixed_attack">Multi-Stage APT Attack</option>
              </select>

              <button
                onClick={handleStartDemo}
                disabled={demoRunning}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md ${
                  demoRunning
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400'
                }`}
              >
                {demoRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {demoRunning ? 'Executing Attack...' : 'Start Demo Attack'}
              </button>

              <Link
                to="/health-validation"
                className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
              >
                <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Health
              </Link>
            </div>
          )}
        </header>

        {/* Live Demo Status Progress Banner on Main Dashboard */}
        {demoRunning && demoStatus && (
          <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-purple-950/90 border border-indigo-500/50 rounded-xl p-4 shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Live Attack Simulation in Progress: <span className="text-indigo-300">{demoStatus.name}</span>
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-700/50">
                Step {currentStep} / 6
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden my-2 border border-slate-800">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-2 transition-all duration-500" 
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>

            {/* Live Message */}
            {lastLog && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mt-1">
                <span className="text-indigo-400 font-bold">[{lastLog.timestamp}] [{lastLog.stage}]:</span>
                <span className="truncate">{lastLog.message}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-cyber-danger/10 border border-cyber-danger text-cyber-danger p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {threats && <ThreatOverview threatData={threats} />}

        {stats && (
          <>
            <NetworkOverview status={stats.status} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1 flex flex-col gap-6">
                <ProtocolDistribution protocols={stats.protocols} />
                <TopEndpoints title="Top Sources" endpoints={stats.top_sources} />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-6">
                {threats ? (
                  <ThreatFeed threats={threats.recent_threats} />
                ) : (
                  <RecentPacketFeed packets={packets} />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TopEndpoints title="Top Destinations" endpoints={stats.top_destinations} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
