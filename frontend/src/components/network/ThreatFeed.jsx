import React from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

const ThreatFeed = ({ threats }) => {
  return (
    <div className="bg-cyber-card border border-cyber-border rounded-2xl p-6 h-[400px] flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-cyber-accent" />
        <h3 className="text-lg font-semibold text-white">Live Threat Feed</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {(!threats || threats.length === 0) ? (
          <div className="h-full flex items-center justify-center text-cyber-muted">
            No active threats detected.
          </div>
        ) : (
          threats.map((item, idx) => (
            <div key={idx} className="bg-cyber-dark/50 border border-cyber-border/50 rounded-lg p-4 transition-all hover:bg-cyber-dark">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {item.prediction.is_threat ? (
                    <ShieldAlert className="h-4 w-4 text-cyber-danger" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                  <span className={`font-medium ${item.prediction.is_threat ? 'text-cyber-danger' : 'text-green-500'}`}>
                    {item.prediction.threat_type}
                  </span>
                </div>
                <span className="text-xs font-mono text-cyber-muted bg-cyber-dark px-2 py-1 rounded">
                  Risk: {item.prediction.risk_score}
                </span>
              </div>
              <p className="text-xs text-cyber-muted font-mono">{item.flow_key}</p>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-cyber-muted">Confidence: {(item.prediction.confidence * 100).toFixed(1)}%</span>
                <span className={`${item.prediction.severity === 'Critical' ? 'text-red-500' : item.prediction.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'}`}>
                  {item.prediction.is_threat ? item.prediction.severity : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThreatFeed;
