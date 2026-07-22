import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const labels = {
    high: '🔴 High',
    medium: '🟡 Medium',
    low: '🟢 Low',
  };

  return (
    <span className={`severity-badge severity-${severity}`}>
      {labels[severity] || severity}
    </span>
  );
};
