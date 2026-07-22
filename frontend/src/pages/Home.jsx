import React, { useState, useEffect } from 'react';
import { useScan } from '../hooks/useScan';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { checkHealth } from '../api/client';

export const Home = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const { loading, status, results, error, startNewScan, pollResults, reset } = useScan();

  // Check backend health on load
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await checkHealth();
        setBackendStatus('online');
      } catch {
        setBackendStatus('offline');
      }
    };
    checkBackend();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    reset();

    try {
      const id = await startNewScan(repoUrl);

      // Poll every 2 seconds
      const interval = setInterval(async () => {
        const data = await pollResults(id);
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Count issues by severity
  const countBySeverity = (severity) => {
    return results?.issues?.filter(i => i.severity === severity).length || 0;
  };

  const getStatusClass = () => {
    if (backendStatus === 'online') return 'status-online';
    if (backendStatus === 'offline') return 'status-offline';
    return 'status-checking';
  };

  const getStatusText = () => {
    if (backendStatus === 'online') return '✅ Online';
    if (backendStatus === 'offline') return '❌ Offline';
    return '⏳ Checking...';
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>🔍 Code Review Platform</h1>
          <p>Analyze your code for bugs, security issues, and more</p>
          <span className={`status ${getStatusClass()}`}>
            Backend: {getStatusText()}
          </span>
        </header>

        {/* Scan Form */}
        <div className="scan-form">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="https://github.com/user/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading || backendStatus === 'offline'}
            />
            <button
              type="submit"
              disabled={loading || !repoUrl || backendStatus === 'offline'}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
          {error && (
            <div className="error">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Progress */}
        {status && status !== 'completed' && status !== 'failed' && (
          <div className="progress">
            <LoadingSpinner />
            <div className="info">
              <div className="label">Scan in progress...</div>
              <StatusBadge status={status} />
            </div>
          </div>
        )}

        {/* Results */}
        {results?.status === 'completed' && (
          <div className="results">
            {/* Summary */}
            <div className="summary">
              <h2>📊 Summary</h2>
              <div className="summary-grid">
                <div className="summary-item total">
                  <div className="number">{results.total_issues}</div>
                  <div className="label">Total Issues</div>
                </div>
                <div className="summary-item high">
                  <div className="number">{countBySeverity('high')}</div>
                  <div className="label">High Severity</div>
                </div>
                <div className="summary-item medium">
                  <div className="number">{countBySeverity('medium')}</div>
                  <div className="label">Medium Severity</div>
                </div>
                <div className="summary-item low">
                  <div className="number">{countBySeverity('low')}</div>
                  <div className="label">Low Severity</div>
                </div>
              </div>
              <div className="meta">
                Scan ID: {results.scan_id} •
                Completed: {results.completed_at ? new Date(results.completed_at).toLocaleString() : 'N/A'}
              </div>
            </div>

            {/* Issues List */}
            <div className="issues-list">
              <h2>📋 Issues</h2>
              {results.issues && results.issues.length > 0 ? (
                results.issues.map((issue, index) => (
                  <div key={index} className={`issue-item ${issue.severity}`}>
                    <div className="issue-header">
                      <SeverityBadge severity={issue.severity} />
                      <span className="issue-line">Line {issue.line}</span>
                      {issue.category && (
                        <span className="issue-category">{issue.category}</span>
                      )}
                    </div>
                    <div className="issue-message">{issue.message}</div>
                    {issue.code_snippet && (
                      <pre className="issue-snippet">{issue.code_snippet}</pre>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-issues">
                  <span className="emoji">🎉</span>
                  No issues found! Great code!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {results?.status === 'failed' && (
          <div className="error-state">
            <h2>❌ Scan Failed</h2>
            <p>{results.error || 'Unknown error'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
