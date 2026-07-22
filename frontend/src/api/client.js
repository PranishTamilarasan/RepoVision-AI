import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Analyze code snippet
export const analyzeCode = async (data) => {
  const response = await api.post('/analyze', data);
  return response.data;
};

// Start a scan
export const startScan = async (data) => {
  const response = await api.post('/scan', data);
  return response.data;
};

// Get scan status
export const getScanStatus = async (scanId) => {
  const response = await api.get(`/scan/${scanId}`);
  return response.data;
};

// List all scans
export const listScans = async () => {
  const response = await api.get('/scans');
  return response.data;
};
