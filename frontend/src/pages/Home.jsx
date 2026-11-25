import { useState, useEffect, useRef, useCallback } from 'react';
import { useScan } from '../hooks/useScan';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { checkHealth, listScans } from '../api/client';

const SEVERITY_FILTERS = ['all', 'high', 'medium', 'low'];

export const Home = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [recentScans, setRecentScans] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const pollIntervalRef = useRef(null);

  const { loading, status, results, error, startNewScan, pollResults, reset } = useScan();

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const fetchRecentScans = useCallback(async () => {
    try {
      const data = await listScans();
      setRecentScans(data?.scans || []);
    } catch {
      // Backend may be offline; status badge handles visibility
    }
  }, []);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await checkHealth();
        setBackendStatus('online');
        fetchRecentScans();
      } catch {
        setBackendStatus('offline');
      }
    };
    checkBackend();

    return () => stopPolling();
  }, [fetchRecentScans, stopPolling]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUrl = repoUrl.trim();
    if (!trimmedUrl) return;

    stopPolling();
    reset();
    setSeverityFilter('all');

    try {
      const id = await startNewScan(trimmedUrl);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const data = await pollResults(id);
          if (data.status === 'completed' || data.status === 'failed') {
            stopPolling();
            fetchRecentScans();
          }
        } catch {
          stopPolling();
        }
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectScan = async (scanId) => {
    stopPolling();
    setSeverityFilter('all');
    try {
      await pollResults(scanId);
    } catch (err) {
      console.error(err);
    }
  };

  const countBySeverity = (severity) => {
    return results?.issues?.filter((i) => i.severity === severity).length || 0;
  };

  const filteredIssues = (results?.issues || []).filter(
    (issue) => severityFilter === 'all' || issue.severity === severityFilter
  );

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
          <div className="nav-brand" style={{ marginBottom: '8px' }}>
            <div className="rv-logo-mark">RV</div>
            <h1>RepoVision AI</h1>
          </div>
          <p>
            Automated static code analysis for GitHub repositories — detect bugs, lint issues, and code quality risks across Python, JavaScript, and TypeScript.
          </p>
          <span className={`status ${getStatusClass()}`}>
            Backend: {getStatusText()}
          </span>
        </header>

        {/* Scan Form */}
        <div className="scan-form">
          <form onSubmit={handleSubmit}>
            <input
              type="url"
              placeholder="https://github.com/owner/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={loading || backendStatus === 'offline'}
              aria-label="GitHub repository URL"
            />
            <button
              type="submit"
              disabled={loading || !repoUrl.trim() || backendStatus === 'offline'}
            >
              {loading ? 'Analyzing...' : 'Analyze Repository'}
            </button>
          </form>
          {error && (
            <div className="error">
              ❌ {error}
            </div>
          )}
        </div>

        {/* In-Progress State */}
        {status && status !== 'completed' && status !== 'failed' && (
          <div className="progress">
            <div className="spinner" aria-hidden="true" />
            <LoadingSpinner />
            <div className="info">
              <div className="label">Scanning repository...</div>
              <StatusBadge status={status} />
            </div>
          </div>
        )}

        {/* Completed Results */}
        {results?.status === 'completed' && (
          <div className="results">
            {/* Summary */}
            <div className="summary">
              <h2>📊 Scan Summary</h2>
              <div className="summary-grid">
                <div className="summary-item total">
                  <div className="number">{results.total_issues ?? 0}</div>
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
                Scan ID: #{results.scan_id} • Completed:{' '}
                {results.completed_at ? new Date(results.completed_at).toLocaleString() : 'N/A'}
              </div>
            </div>

            {/* Issues List */}
            <div className="issues-list">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <h2 style={{ marginBottom: 0 }}>📋 Detected Issues ({filteredIssues.length})</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {SEVERITY_FILTERS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverityFilter(level)}
                      className={`nav-btn ${
                        severityFilter === level ? 'nav-btn-primary' : 'nav-btn-ghost'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue, index) => (
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
                  {results.issues?.length > 0
                    ? `No ${severityFilter} severity issues found.`
                    : 'No issues found! Clean repository!'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {results?.status === 'failed' && (
          <div className="error-state">
            <h2>❌ Scan Failed</h2>
            <p>{results.error || 'Unknown error occurred during repository analysis.'}</p>
          </div>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="issues-list" style={{ marginTop: '30px' }}>
            <h2>🕒 Recent Scans</h2>
            {recentScans.slice(0, 10).map((scan) => (
              <div
                key={scan.id}
                className="issue-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  cursor: 'pointer',
                }}
                onClick={() => handleSelectScan(scan.id)}
              >
                <div>
                  <div className="issue-message" style={{ fontWeight: 600 }}>
                    {scan.repo_url}
                  </div>
                  <div className="issue-line">
                    Scan #{scan.id} • {scan.total_issues ?? 0} issues
                    {scan.created_at
                      ? ` • ${new Date(scan.created_at).toLocaleString()}`
                      : ''}
                  </div>
                </div>
                <StatusBadge status={scan.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
