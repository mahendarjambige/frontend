import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="participant-page-content" style={{ maxWidth: '650px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Your personal account information and credentials.</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="avatar-circle" style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}>
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{profile?.name}</h2>
            <span className={`role-badge ${profile?.role === 'ROLE_ADMIN' || profile?.role === 'ADMIN' ? 'role-admin' : 'role-participant'}`} style={{ fontSize: '0.8rem', padding: '3px 10px' }}>
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
    </div>
  );
};

export default Profile;
