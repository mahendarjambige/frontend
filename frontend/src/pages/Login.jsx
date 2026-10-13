import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('role') === 'admin' || searchParams.get('type') === 'admin' ? 'admin' : 'user';

  const [activeTab, setActiveTab] = useState(initialMode);
  // Email starts completely empty - no prefilling of admin email!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password flow states
  const [forgotMode, setForgotMode] = useState(null); // null | 'request' | 'verify'
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [receivedCodeHint, setReceivedCodeHint] = useState('');

  const { login, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // RULE 1: Never show login interface if admin or user is already logged in.
  // Immediately redirect to their respective dashboard.
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  // Sync tab with URL query parameters
  useEffect(() => {
    const roleParam = searchParams.get('role') || searchParams.get('type');
    if (roleParam === 'admin') {
      setActiveTab('admin');
    } else if (roleParam === 'user') {
      setActiveTab('user');
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccessMessage('');
    setPassword('');
    setForgotMode(null);
    setSearchParams({ role: tab });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(cleanEmail, password);

      // Verify role alignment
      if (activeTab === 'admin' && res.role !== 'ROLE_ADMIN' && res.role !== 'ADMIN') {
        setError('Access Denied: This account does not have administrator privileges. Please use User Sign-In.');
        return;
      }

      if (res.role === 'ROLE_ADMIN' || res.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password: Request unique code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.forgotPassword(cleanEmail);
      setReceivedCodeHint(res.code || '');
      setSuccessMessage(res.message || 'A unique verification code has been generated and sent to your email.');
      setForgotMode('verify');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request reset code. Please check your email and try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password: Verify code and set new password
  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = resetEmail.trim().toLowerCase();
    const cleanCode = resetCode.trim();

    if (!cleanCode) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.resetPassword(cleanEmail, cleanCode, resetNewPassword);
      setEmail(cleanEmail);
      setPassword('');
      setForgotMode(null);
      setSuccessMessage(res.message || 'Password updated successfully! You can now sign in with your new password.');
      setResetCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setReceivedCodeHint('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please check the code and try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page-wrapper">
        <LoadingSpinner message="Checking session..." />
      </div>
    );
  }

  // If already authenticated, do not render login screen
  if (isAuthenticated) {
    return null;
  }

  const isAdminTab = activeTab === 'admin';

  return (
    <div className="auth-page-wrapper">
      <div className={`auth-card ${isAdminTab ? 'admin-mode' : 'user-mode'}`}>

        {/* Dual Sign-In Switcher Tabs */}
        {!forgotMode && (
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${!isAdminTab ? 'active' : ''}`}
              onClick={() => switchTab('user')}
            >
              <span>👤</span>
              <span>User Sign-In</span>
            </button>

            <button
              type="button"
              className={`auth-tab-btn ${isAdminTab ? 'active admin-active' : ''}`}
              onClick={() => switchTab('admin')}
            >
              <span>🛡️</span>
              <span>Admin Sign-In</span>
            </button>
          </div>
        )}

        {/* ================= FORGOT PASSWORD FLOW ================= */}
        {forgotMode ? (
          <div>
            <div className="auth-header">
              <div>
                <span className="portal-badge-pill portal-badge-user">
                  {forgotMode === 'request' ? '🔑 Password Recovery' : '🔐 Verification'}
                </span>
              </div>
              <h2 className="auth-title">
                {forgotMode === 'request' ? 'Forgot Password' : 'Set New Password'}
              </h2>
              <p className="auth-subtitle">
                {forgotMode === 'request'
                  ? 'Enter your registered email to receive a unique verification code'
                  : `Enter the verification code sent to ${resetEmail}`}
              </p>
            </div>

            {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
            {successMessage && <AlertMessage type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {receivedCodeHint && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                <div><strong>Email Verification Notice:</strong></div>
                <div>Unique Code for <code>{resetEmail}</code>: <span style={{ fontWeight: 700, letterSpacing: '2px', fontSize: '1.05rem', color: '#15803d' }}>{receivedCodeHint}</span></div>
                <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '0.25rem' }}>Valid for 15 minutes. Enter this code below to set your new password.</div>
              </div>
            )}

            {forgotMode === 'request' ? (
              <form onSubmit={handleRequestResetCode}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-email">Your Account Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending Code...' : 'Send Verification Code →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmResetPassword}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-code">6-Digit Verification Code</label>
                  <input
                    id="reset-code"
                    type="text"
                    maxLength={6}
                    className="form-control"
                    placeholder="Enter 6-digit code (e.g. 123456)"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    style={{ letterSpacing: '3px', fontWeight: 600, fontSize: '1.1rem', textAlign: 'center' }}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reset-new-password">New Password</label>
                  <input
                    id="reset-new-password"
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reset-confirm-password">Confirm New Password</label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating Password...' : 'Save New Password & Sign In'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={handleRequestResetCode}
                    disabled={isSubmitting}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Didn't receive code? Resend Code
                  </button>
                </div>
              </form>
            )}

            <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(null);
                  setError('');
                  setSuccessMessage('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* ================= NORMAL SIGN-IN FLOW ================= */
          <div>
            {/* Portal Header */}
            <div className="auth-header">
              {isAdminTab ? (
                <>
                  <div>
                    <span className="portal-badge-pill portal-badge-admin">
                      🛡️ Administrator Portal
                    </span>
                  </div>
                  <h2 className="auth-title">Admin Sign-In</h2>
                  <p className="auth-subtitle">
                    Sign in to manage platform surveys, polls, and users
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <span className="portal-badge-pill portal-badge-user">
                      👤 Participant Portal
                    </span>
                  </div>
                  <h2 className="auth-title">User Sign-In</h2>
                  <p className="auth-subtitle">
                    Sign in to your PollSphere account to participate
                  </p>
                </>
              )}
            </div>

            {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
            {successMessage && <AlertMessage type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  {isAdminTab ? 'Admin Email Address' : 'Email Address'}
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder={isAdminTab ? 'admin@example.com' : 'name@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  {!isAdminTab && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setForgotMode('request');
                        setError('');
                        setSuccessMessage('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: 500
                      }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  style={{ marginTop: '0.4rem' }}
                  placeholder={isAdminTab ? 'Enter Admin password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn ${isAdminTab ? 'btn-pollsphere-primary' : 'btn-primary'}`}
                style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Authenticating...'
                ) : isAdminTab ? (
                  '🛡️ Sign In as Admin'
                ) : (
                  'Sign In as User →'
                )}
              </button>
            </form>

            <div className="auth-footer">
              {isAdminTab ? (
                <div>
                  Standard participant or student?{' '}
                  <a
                    href="#user-login"
                    onClick={(e) => {
                      e.preventDefault();
                      switchTab('user');
                    }}
                  >
                    Switch to User Sign-In
                  </a>
                </div>
              ) : (
                <div>
                  Don't have an account yet?{' '}
                  <Link to="/register">Create an account</Link>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
