import React, { useEffect, useState, useRef } from 'react';
import { getNetworkStatistics, getRecentPackets, getThreatFeed } from '../services/networkApi';
import NetworkOverview from '../components/network/NetworkOverview';
import ProtocolDistribution from '../components/network/ProtocolDistribution';
import RecentPacketFeed from '../components/network/RecentPacketFeed';
import TopEndpoints from '../components/network/TopEndpoints';
import ThreatOverview from '../components/network/ThreatOverview';
import ThreatFeed from '../components/network/ThreatFeed';
import { ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [packets, setPackets] = useState([]);
  const [threats, setThreats] = useState(null);
  const [error, setError] = useState(null);
  const prevThreatCountRef = useRef(null);

  const roleName = user?.role?.role_name || 'Security Analyst';
  const isSocManager = roleName === 'SOC Manager' || roleName === 'Administrator';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, packetsData, threatsData] = await Promise.all([
          getNetworkStatistics(),
          getRecentPackets(),
          getThreatFeed().catch(() => null) // Ignore error if AI backend isn't ready
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

    fetchData();
    const interval = setInterval(fetchData, 2000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset baseline to current threat count on tab/system wake-up
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

  useEffect(() => {
    if (threats && threats.active_threats_count > 0) {
      if (prevThreatCountRef.current !== null && threats.active_threats_count > prevThreatCountRef.current) {
        const latestThreat = threats.recent_threats[0];
        toast.error(
          <div>
            <strong>Threat Detected!</strong><br/>
            {latestThreat.prediction.threat_type} from {latestThreat.flow_key.split(' -> ')[0]}
          </div>, 
          { duration: 5000 }
        );
      }
      prevThreatCountRef.current = threats.active_threats_count;
    } else if (threats && threats.active_threats_count === 0) {
      prevThreatCountRef.current = 0;
    }
  }, [threats]);

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-cyber-border/40 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-cyber-accent h-7 w-7" />
              Network Traffic Analytics
            </h1>
            <p className="text-xs md:text-sm text-cyber-muted mt-1">Real-time AI packet monitoring, flow extraction, and threat telemetry console.</p>
          </div>
        </header>

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
