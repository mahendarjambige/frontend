import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">ADMIN PANEL</span>
      </div>
      <nav className="sidebar-menu">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">📈</span>
          <span className="sidebar-label">Dashboard</span>
        </NavLink>

        <div className="sidebar-section-divider">SURVEYS</div>

        <NavLink
          to="/admin/surveys"
          end
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">📋</span>
          <span className="sidebar-label">Manage Surveys</span>
        </NavLink>

        <NavLink
          to="/admin/surveys/create"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">➕</span>
          <span className="sidebar-label">Create Survey</span>
        </NavLink>

        <div className="sidebar-section-divider">POLLS</div>

        <NavLink
          to="/admin/polls"
          end
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">🗳️</span>
          <span className="sidebar-label">Manage Polls</span>
        </NavLink>

        <NavLink
          to="/admin/polls/create"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">➕</span>
          <span className="sidebar-label">Create Poll</span>
        </NavLink>

        <div className="sidebar-section-divider">SYSTEM</div>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">👥</span>
          <span className="sidebar-label">Manage Users</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
