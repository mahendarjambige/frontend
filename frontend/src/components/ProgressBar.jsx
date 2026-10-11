import React from 'react';

const ProgressBar = ({ percentage = 0, color = 'primary', showLabel = true, count = null }) => {
  const safePercent = Math.min(100, Math.max(0, percentage));

  return (
    <div className="progress-wrapper">
      <div className="progress-header">
        {count !== null && <span className="progress-count">{count} {count === 1 ? 'vote' : 'votes'}</span>}
        {showLabel && <span className="progress-percent">{safePercent.toFixed(1)}%</span>}
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill progress-fill-${color}`}
          style={{ width: `${safePercent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
