import React from 'react';

export const StatusBadge = ({ status }) => {
  const labels = {
    queued: '⏳ Queued',
    cloning: '📥 Cloning',
    analyzing: '🔍 Analyzing',
    completed: '✅ Completed',
    failed: '❌ Failed',
  };

  return (
    <span className={`status-badge status-${status}`}>
      {labels[status] || status}
    </span>
  );
};
