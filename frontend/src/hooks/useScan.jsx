import { useState } from 'react';
import { startScan, getScanStatus } from '../api/client';

export const useScan = () => {
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const startNewScan = async (repoUrl) => {
    setLoading(true);
    setError(null);

    try {
      const response = await startScan({ repo_url: repoUrl });
      setScanId(response.scan_id);
      setStatus('queued');
      return response.scan_id;
    } catch (err) {
      setError(err.message || 'Failed to start scan');
      setLoading(false);
      throw err;
    }
  };

  const pollResults = async (id) => {
    try {
      const data = await getScanStatus(id);
      setStatus(data.status);

      if (data.status === 'completed' || data.status === 'failed') {
        setResults(data);
        setLoading(false);
        return data;
      }

      return data;
    } catch (err) {
      setError(err.message || 'Failed to get scan status');
      setLoading(false);
      throw err;
    }
  };

  const reset = () => {
    setLoading(false);
    setScanId(null);
    setStatus('');
    setResults(null);
    setError(null);
  };

  return {
    loading,
    scanId,
    status,
    results,
    error,
    startNewScan,
    pollResults,
    reset,
  };
};
