import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'} className="navbar-brand">
          <div className="brand-logo-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
              <path d="M3 14l5-5 4 4 8-8" />
              <path d="M16 5h4v4" />
            </svg>
          </div>
          <div className="brand-texts">
            <span className="brand-name">PollSphere</span>
            <span className="brand-tagline">Survey & Polling System</span>
          </div>
        </Link>

        <nav className="navbar-nav">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                  <Link to="/admin/surveys" className={`nav-link ${isActive('/admin/surveys') ? 'active' : ''}`}>
                    Surveys
                  </Link>
                  <Link to="/admin/polls" className={`nav-link ${isActive('/admin/polls') ? 'active' : ''}`}>
                    Polls
                  </Link>
                  <Link to="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                    Dashboard
                  </Link>
                  <Link to="/surveys" className={`nav-link ${isActive('/surveys') ? 'active' : ''}`}>
                    Surveys
                  </Link>
                  <Link to="/polls" className={`nav-link ${isActive('/polls') ? 'active' : ''}`}>
                    Polls
                  </Link>
                  <Link to="/history" className={`nav-link ${isActive('/history') ? 'active' : ''}`}>
                    My History
                  </Link>
                </>
              )}

              <div className="navbar-user-section">
                <Link to="/profile" className="user-profile-badge">
                  <div className="avatar-circle">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-info-text">
                    <span className="user-name">{user?.name}</span>
                    <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-participant'}`}>
                      {isAdmin ? 'ADMIN' : 'PARTICIPANT'}
                    </span>
                  </div>
                </Link>

                <button onClick={handleLogout} className="btn-logout" title="Sign out">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="btn-nav-login">
                Login
              </Link>
              <Link to="/register" className="btn-nav-register">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
