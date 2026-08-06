import React, { useEffect, useState } from 'react';
import { getIncidents, updateIncident } from '../services/socApi';
import { FileWarning, RefreshCw, AlertOctagon, CheckCircle } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvestigate = async (incidentId) => {
    await updateIncident(incidentId, { status: "Investigating" });
    fetchIncidents();
  };

  const handleResolve = async (incidentId) => {
    const notes = prompt("Enter resolution notes:");
    if (notes) {
      await updateIncident(incidentId, { status: "Resolved", resolution_notes: notes });
      fetchIncidents();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="bg-cyber-danger/20 text-cyber-danger px-2 py-1 rounded text-xs font-bold">Open</span>;
      case 'Investigating':
        return <span className="bg-cyber-accent/20 text-cyber-accent px-2 py-1 rounded text-xs font-bold">Investigating</span>;
      case 'Resolved':
      case 'Closed':
        return <span className="bg-cyber-success/20 text-cyber-success px-2 py-1 rounded text-xs font-bold">{status}</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center mb-6 border-b border-cyber-border/40 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FileWarning className="text-cyber-accent h-7 w-7" />
            Incident Management &amp; Triage
          </h1>
        </header>

        <div className="bg-cyber-card border border-cyber-border rounded-xl p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cyber-border text-cyber-muted text-xs uppercase font-bold">
                <th className="py-3">Incident ID</th>
                <th>Alert ID (DB)</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date &amp; Time</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(i => (
                <tr key={i.id} className="border-b border-cyber-border/50 hover:bg-white/5 transition-colors text-sm">
                  <td className="py-3 font-mono text-cyber-muted">{i.incident_id.substring(0, 8)}...</td>
                  <td className="text-white font-mono">{i.alert_id}</td>
                  <td className={i.priority === 'Critical' ? 'text-cyber-danger font-bold' : 'text-cyber-accent'}>{i.priority}</td>
                  <td>{getStatusBadge(i.status)}</td>
                  <td className="text-xs font-mono text-white">{formatDateTime(i.created_at)}</td>
                  <td className="text-sm text-cyber-muted truncate max-w-[200px]">{i.resolution_notes || '-'}</td>
                  <td className="flex gap-2 py-2">
                    {i.status === 'Open' && (
                      <button onClick={() => handleInvestigate(i.incident_id)} className="bg-cyber-accent text-cyber-bg px-3 py-1 rounded text-sm hover:opacity-80 font-bold transition-all">
                        Investigate
                      </button>
                    )}
                    {i.status !== 'Resolved' && i.status !== 'Closed' && (
                      <button onClick={() => handleResolve(i.incident_id)} className="bg-cyber-success text-cyber-bg px-3 py-1 rounded text-sm hover:opacity-80 font-bold transition-all">
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {incidents.length === 0 && (
                <tr><td colSpan="7" className="py-8 text-center text-cyber-muted">No incidents found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Incidents;

