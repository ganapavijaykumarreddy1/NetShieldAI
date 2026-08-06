import React, { useState } from 'react';
import { generatePdfReport, generateCsvReport } from '../services/socApi';
import { FileText, Download } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (type) => {
    setLoading(true);
    try {
      let data, filename;
      if (type === 'pdf') {
        data = await generatePdfReport();
        filename = 'daily_summary.pdf';
      } else {
        data = await generateCsvReport();
        filename = 'alerts_export.csv';
      }

      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center mb-6 border-b border-cyber-border/40 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-cyber-accent h-7 w-7" />
            SOC Reporting Engine
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 flex flex-col items-center text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Daily Summary (PDF)</h3>
            <p className="text-sm text-cyber-muted">Executive summary of the last 24 hours, including threat statistics and risk distribution.</p>
            <button 
              onClick={() => handleDownload('pdf')} 
              disabled={loading}
              className="mt-4 flex items-center gap-2 bg-cyber-accent text-cyber-bg px-4 py-2 rounded font-bold hover:opacity-80 disabled:opacity-50"
            >
              <Download size={18} /> Download PDF
            </button>
          </div>

          <div className="bg-cyber-card border border-cyber-border rounded-xl p-6 flex flex-col items-center text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Alerts Export (CSV)</h3>
            <p className="text-sm text-cyber-muted">Raw CSV export of recent alerts for external analysis and long-term archiving.</p>
            <button 
              onClick={() => handleDownload('csv')} 
              disabled={loading}
              className="mt-4 flex items-center gap-2 bg-cyber-accent text-cyber-bg px-4 py-2 rounded font-bold hover:opacity-80 disabled:opacity-50"
            >
              <Download size={18} /> Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
