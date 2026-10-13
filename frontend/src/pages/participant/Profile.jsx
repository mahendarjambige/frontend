import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const Profile = () => {
  const { user, deleteAccount, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getCurrentUser();
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  const roleName = profile?.role === 'ROLE_ADMIN' || profile?.role === 'ADMIN' ? 'Administrator' : 'Participant';
  const isPrimaryAdmin = profile?.email?.toLowerCase() === 'mahendarjambige@gmail.com' || isAdmin;

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you absolutely sure you want to delete your account?\n\n' +
      '• Your user profile will be permanently deleted.\n' +
      '• All your submitted survey responses will be removed.\n' +
      '• All your cast poll votes will be cleared.\n\n' +
      'This action cannot be undone!'
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteAccount();
      alert('Your account has been deleted successfully.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account. Please try again.';
      setAlert({ type: 'error', message: msg });
      setIsDeleting(false);
    }
  };

  return (
    <div className="participant-page-content" style={{ maxWidth: '650px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Your personal account information and credentials.</p>
        </div>
      </div>

      {alert.message && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      )}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="avatar-circle" style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}>
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{profile?.name}</h2>
            <span
              className={`role-badge ${isPrimaryAdmin ? 'role-admin' : 'role-participant'}`}
              style={{ fontSize: '0.8rem', padding: '3px 10px' }}
            >
              {roleName}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              User ID
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 500, marginTop: '0.2rem' }}>#{profile?.id}</p>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Email Address
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 500, marginTop: '0.2rem' }}>{profile?.email}</p>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              System Role
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 500, marginTop: '0.2rem' }}>{roleName} ({profile?.role})</p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Account Created
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 500, marginTop: '0.2rem' }}>
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'Active Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Account Deletion Section */}
      {isPrimaryAdmin ? (
        <div
          className="card"
          style={{
            marginTop: '1.5rem',
            border: '1px solid #bfdbfe',
            background: '#f8fafc',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🔒</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e3a8a' }}>
              Designated Primary Administrator
            </h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            This account is the single designated administrator for the system. It cannot be deleted or demoted to preserve platform stability and security.
          </p>
        </div>
      ) : (
        <div
          className="card"
          style={{
            marginTop: '1.5rem',
            border: '1px solid #fecaca',
            background: '#fffafa',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#b91c1c' }}>
              Danger Zone: Delete Account
            </h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Permanently delete your account. This will erase your user record along with all your survey responses and poll votes. This action cannot be reversed.
          </p>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            style={{ fontWeight: 600 }}
          >
            {isDeleting ? 'Deleting Account...' : '🗑️ Delete My Account'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
