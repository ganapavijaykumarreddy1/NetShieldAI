import React from 'react';

const RecentPacketFeed = ({ packets }) => {
  if (!packets || packets.length === 0) return (
    <div className="cyber-glass rounded-2xl p-6 h-80 flex items-center justify-center">
      <p className="text-cyber-muted">No recent packets.</p>
    </div>
  );

  return (
    <div className="cyber-glass rounded-2xl p-6 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Packet Feed</h3>
      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        <table className="w-full text-left text-sm text-cyber-muted">
          <thead className="sticky top-0 bg-cyber-bg/90 backdrop-blur pb-2 text-xs uppercase text-cyber-muted/80">
            <tr>
              <th className="py-2">Time</th>
              <th className="py-2">Protocol</th>
              <th className="py-2">Source</th>
              <th className="py-2">Destination</th>
              <th className="py-2">Length</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {packets.slice().reverse().map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2 whitespace-nowrap">{new Date(p.timestamp).toLocaleTimeString()}</td>
                <td className="py-2">
                  <span className="px-2 py-1 rounded bg-cyber-accent/10 text-cyber-accent text-xs">
                    {p.protocol}
                  </span>
                </td>
                <td className="py-2 font-mono text-xs">{p.source_ip || '-'}</td>
                <td className="py-2 font-mono text-xs">{p.destination_ip || '-'}</td>
                <td className="py-2">{p.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentPacketFeed;
