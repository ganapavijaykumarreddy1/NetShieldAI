import React from 'react';
import { Activity, Zap, HardDrive, Wifi } from 'lucide-react';

const NetworkOverview = ({ status }) => {
  if (!status) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard 
        title="Total Packets" 
        value={status.total_packets.toLocaleString()} 
        icon={<HardDrive className="h-6 w-6 text-cyber-accent" />} 
      />
      <StatCard 
        title="Packets/sec" 
        value={status.packets_per_second.toLocaleString()} 
        icon={<Activity className="h-6 w-6 text-cyber-accent" />} 
      />
      <StatCard 
        title="Bytes/sec" 
        value={status.bytes_per_second.toLocaleString()} 
        icon={<Zap className="h-6 w-6 text-cyber-accent" />} 
      />
      <StatCard 
        title="Active Conns" 
        value={status.active_connections.toLocaleString()} 
        icon={<Wifi className="h-6 w-6 text-cyber-accent" />} 
      />
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="cyber-glass rounded-2xl p-6 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-cyber-muted mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
    <div className="p-3 bg-cyber-accent/10 rounded-xl border border-white/5">
      {icon}
    </div>
  </div>
);

export default NetworkOverview;
