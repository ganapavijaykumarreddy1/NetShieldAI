import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProtocolDistribution = ({ protocols }) => {
  if (!protocols) return null;

  const data = {
    labels: ['TCP', 'UDP', 'ICMP', 'ARP', 'Other'],
    datasets: [
      {
        data: [
          protocols.tcp,
          protocols.udp,
          protocols.icmp,
          protocols.arp,
          protocols.other
        ],
        backgroundColor: [
          'rgba(0, 229, 255, 0.8)',
          'rgba(255, 0, 128, 0.8)',
          'rgba(128, 0, 255, 0.8)',
          'rgba(255, 128, 0, 0.8)',
          'rgba(128, 128, 128, 0.8)'
        ],
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#8b949e',
          font: { family: 'Inter' }
        }
      }
    }
  };

  return (
    <div className="cyber-glass rounded-2xl p-6 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Protocol Distribution</h3>
      <div className="flex-1 relative">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default ProtocolDistribution;
