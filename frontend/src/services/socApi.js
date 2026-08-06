import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/soc';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ns_token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const getAlerts = async (skip = 0, limit = 100) => {
  const res = await axios.get(`${API_BASE}/alerts/?skip=${skip}&limit=${limit}`, getAuthHeaders());
  return res.data;
};

export const acknowledgeAlert = async (alertId) => {
  const res = await axios.put(`${API_BASE}/alerts/${alertId}/acknowledge`, {}, getAuthHeaders());
  return res.data;
};

export const getIncidents = async (skip = 0, limit = 100) => {
  const res = await axios.get(`${API_BASE}/incidents/?skip=${skip}&limit=${limit}`, getAuthHeaders());
  return res.data;
};

export const createIncident = async (data) => {
  const res = await axios.post(`${API_BASE}/incidents/`, data, getAuthHeaders());
  return res.data;
};

export const updateIncident = async (incidentId, data) => {
  const res = await axios.put(`${API_BASE}/incidents/${incidentId}`, data, getAuthHeaders());
  return res.data;
};

export const getThreatIntel = async () => {
  const res = await axios.get(`${API_BASE}/threat-intel/`, getAuthHeaders());
  return res.data;
};

export const getAnalyticsSummary = async () => {
  const res = await axios.get(`${API_BASE}/analytics/summary`, getAuthHeaders());
  return res.data;
};

export const getAnalyticsCategories = async () => {
  const res = await axios.get(`${API_BASE}/analytics/categories`, getAuthHeaders());
  return res.data;
};

export const getAnalyticsTimeline = async () => {
  const res = await axios.get(`${API_BASE}/analytics/timeline`, getAuthHeaders());
  return res.data;
};

export const getAnalyticsTopIps = async () => {
  const res = await axios.get(`${API_BASE}/analytics/top-ips`, getAuthHeaders());
  return res.data;
};

export const getDetailedAnalytics = async (days = 7) => {
  const res = await axios.get(`${API_BASE}/analytics/detailed?days=${days}`, getAuthHeaders());
  return res.data;
};

export const sendAlertEmail = async (alertId) => {
  const res = await axios.post(`${API_BASE}/alerts/${alertId}/send-email`, {}, getAuthHeaders());
  return res.data;
};

export const sendTestEmail = async (recipientEmail) => {
  const res = await axios.post(`${API_BASE}/notifications/test-email`, { recipient_email: recipientEmail }, getAuthHeaders());
  return res.data;
};

export const getSmtpSettings = async () => {
  const res = await axios.get(`${API_BASE}/notifications/settings`, getAuthHeaders());
  return res.data;
};

export const updateSmtpSettings = async (data) => {
  const res = await axios.post(`${API_BASE}/notifications/settings`, data, getAuthHeaders());
  return res.data;
};

export const generatePdfReport = async () => {
  const res = await axios.post(`${API_BASE}/reports/generate/daily-pdf`, {}, {
    ...getAuthHeaders(),
    responseType: 'blob'
  });
  return res.data;
};

export const generateCsvReport = async () => {
  const res = await axios.post(`${API_BASE}/reports/generate/alerts-csv`, {}, {
    ...getAuthHeaders(),
    responseType: 'blob'
  });
  return res.data;
};

// Admin User Management API
export const getUsers = async () => {
  const res = await axios.get(`http://localhost:8000/api/users/`, getAuthHeaders());
  return res.data;
};

export const createUser = async (userData) => {
  const res = await axios.post(`http://localhost:8000/api/users/`, userData, getAuthHeaders());
  return res.data;
};

export const updateUserRole = async (userId, roleName) => {
  const res = await axios.put(`http://localhost:8000/api/users/${userId}/role`, { role_name: roleName }, getAuthHeaders());
  return res.data;
};

export const updateUserStatus = async (userId, isActive) => {
  const res = await axios.put(`http://localhost:8000/api/users/${userId}/status`, { is_active: isActive }, getAuthHeaders());
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await axios.delete(`http://localhost:8000/api/users/${userId}`, getAuthHeaders());
  return res.data;
};


