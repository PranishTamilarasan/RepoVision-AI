import React from 'react';

export const StatusBadge = ({ status }) => {
  const configs = {
    queued: { label: 'Queued', icon: '\u23f3', className: 'badge-queued' },
    cloning: { label: 'Cloning', icon: '\ud83d\udce5', className: 'badge-cloning' },
    analyzing: { label: 'Analyzing', icon: '\ud83d\udd0d', className: 'badge-analyzing' },
    completed: { label: 'Completed', icon: '\u2705', className: 'badge-completed' },
    failed: { label: 'Failed', icon: '\u274c', className: 'badge-failed' }
  };

  const config = configs[status] || configs.failed;

  return (
    <span className={`status-badge ${config.className}`}> {config.icon} {config.label} </span>
  );
};