import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const configs = {
    high: {
      label: 'High',
      icon: '⚠️',
      className: 'badge-high'
    },
    medium: {
      label: 'Medium',
      icon: '🔶',
      className: 'badge-medium'
    },
    low: {
      label: 'Low',
      icon: '✓',
      className: 'badge-low'
    }
  };

  const config = configs[severity] || configs.low;

  return (
    <span className={`severity-badge ${config.className}`}>
      <span className="badge-icon">{config.icon}</span>
      <span className="badge-text">{config.label}</span>
    </span>
  );
};