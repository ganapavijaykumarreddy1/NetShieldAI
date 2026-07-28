import axios from 'axios';

export const getNetworkStatus = async () => {
  const response = await axios.get('/api/network/status');
  return response.data;
};

export const getNetworkStatistics = async () => {
  const response = await axios.get('/api/network/statistics');
  return response.data;
};

export const getProtocolDistribution = async () => {
  const response = await axios.get('/api/network/protocols');
  return response.data;
};

export const getActiveConnections = async () => {
  const response = await axios.get('/api/network/connections');
  return response.data;
};

export const getRecentPackets = async () => {
  const response = await axios.get('/api/network/packets/recent');
  return response.data;
};

export const getThreatFeed = async () => {
  const response = await axios.get('/api/threats/feed');
  return response.data;
};
