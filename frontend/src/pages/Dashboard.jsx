import React, { useEffect, useState } from 'react';
import { getNetworkStatistics, getRecentPackets, getThreatFeed } from '../services/networkApi';
import NetworkOverview from '../components/network/NetworkOverview';
import ProtocolDistribution from '../components/network/ProtocolDistribution';
import RecentPacketFeed from '../components/network/RecentPacketFeed';
import TopEndpoints from '../components/network/TopEndpoints';
import ThreatOverview from '../components/network/ThreatOverview';
import ThreatFeed from '../components/network/ThreatFeed';
import { ShieldAlert } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [packets, setPackets] = useState([]);
  const [threats, setThreats] = useState(null);
  const [error, setError] = useState(null);

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
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-cyber-accent h-8 w-8" />
            Network Traffic Analytics
          </h1>
          <p className="text-cyber-muted mt-2">Live monitoring of incoming and outgoing packets.</p>
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
