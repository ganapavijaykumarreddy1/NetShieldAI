import React from 'react';

const TopEndpoints = ({ title, endpoints }) => {
  if (!endpoints || endpoints.length === 0) return (
    <div className="cyber-glass rounded-2xl p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <p className="text-cyber-muted m-auto">No data available.</p>
    </div>
  );

  const maxCount = Math.max(...endpoints.map(e => e.count));

  return (
    <div className="cyber-glass rounded-2xl p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex-1 flex flex-col gap-3">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-cyber-muted">{ep.ip}</span>
              <span className="text-white font-medium">{ep.count} px</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div 
                className="bg-cyber-accent h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${(ep.count / maxCount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopEndpoints;
