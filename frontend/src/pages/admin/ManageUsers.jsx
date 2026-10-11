import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId, userName, userEmail) => {
    if (userId === currentUser?.id || userEmail.toLowerCase() === 'mahendarjambige@gmail.com') {
      setAlert({ type: 'error', message: 'You cannot delete the primary admin account.' });
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await userService.deleteUser(userId);
        setAlert({ type: 'success', message: 'User deleted successfully.' });
        fetchUsers();
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to delete user.';
        setAlert({ type: 'error', message: msg });
      }
    }
  };

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Users</h1>
            <p className="page-subtitle">Platform user directory. Enforcing single-admin security policy.</p>
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
          <div className="card-header">
            <h2 className="card-title">Registered Users ({users.length})</h2>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading user accounts..." />
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered At</th>
                    <th>Admin Status</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isPrimaryAdmin = u.email?.toLowerCase() === 'mahendarjambige@gmail.com';
                    const isSelf = u.id === currentUser?.id;

                    return (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td style={{ fontWeight: 600 }}>
                          {u.name} {isSelf && '(You)'}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${isPrimaryAdmin ? 'role-admin' : 'role-participant'}`}>
                            {isPrimaryAdmin ? 'ADMIN' : 'PARTICIPANT'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          {isPrimaryAdmin ? (
                            <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
                              🔒 Designated Admin
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Standard Participant
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={isPrimaryAdmin || isSelf}
                            onClick={() => handleDelete(u.id, u.name, u.email)}
                            title={isPrimaryAdmin ? 'Cannot delete primary admin' : 'Delete user'}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
