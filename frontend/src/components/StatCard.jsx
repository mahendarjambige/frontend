import React from 'react';

const StatCard = ({ title, value, icon, subtitle, color = 'blue' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-body">
        <div className="stat-card-info">
          <span className="stat-card-title">{title}</span>
          <h3 className="stat-card-value">{value}</h3>
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        </div>
        {icon && <div className="stat-card-icon">{icon}</div>}
      </div>
    </div>
  );
};

export default StatCard;
