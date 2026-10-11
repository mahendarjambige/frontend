import React from 'react';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert-box alert-${type}`}>
      <div className="alert-content">
        <span className="alert-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '⚠'}
          {type === 'info' && 'ℹ'}
        </span>
        <span className="alert-text">{message}</span>
      </div>
      {onClose && (
        <button type="button" className="alert-close-btn" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
