import React, { useEffect, useState } from 'react';
import { getThreatIntel } from '../services/socApi';
import { BookOpen } from 'lucide-react';

const ThreatIntel = () => {
  const [intel, setIntel] = useState([]);

  useEffect(() => {
    fetchIntel();
  }, []);

  const fetchIntel = async () => {
    try {
      const data = await getThreatIntel();
      setIntel(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center mb-6 border-b border-cyber-border/40 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-cyber-accent h-7 w-7" />
            Threat Intelligence Knowledge Base
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {intel.map(t => (
            <div key={t.id} className="bg-cyber-card border border-cyber-border rounded-xl p-6 space-y-3">
              <h3 className="text-xl font-bold text-white">{t.threat_name}</h3>
              <div className="flex gap-4 text-sm text-cyber-muted">
                <span>Category: <span className="text-white">{t.attack_category}</span></span>
                <span>Severity: <span className={t.severity === 'Critical' ? 'text-cyber-danger font-bold' : 'text-cyber-accent'}>{t.severity}</span></span>
              </div>
              <p className="text-sm"><strong>Explanation:</strong> {t.risk_explanation}</p>
              <p className="text-sm text-cyber-accent"><strong>Mitigation:</strong> {t.recommended_mitigation}</p>
              {t.references_json && (
                <p className="text-xs text-cyber-muted mt-2">
                  Refs: CWE: {t.references_json.cwe}, MITRE: {t.references_json.mitre}
                </p>
              )}
            </div>
          ))}
          {intel.length === 0 && (
            <div className="text-cyber-muted">No threat intelligence data found. (Try restarting backend to seed).</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatIntel;
