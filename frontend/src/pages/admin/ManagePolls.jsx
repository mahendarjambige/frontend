import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { pollService } from '../../services/pollService';

const ManagePolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchPolls = async () => {
    try {
      const data = await pollService.getAllPolls();
      setPolls(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load polls.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await pollService.updatePollStatus(id, newStatus);
      setAlert({ type: 'success', message: `Poll status updated to ${newStatus}.` });
      fetchPolls();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update poll status.' });
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the poll "${title}"? All submitted votes will be deleted.`)) {
      try {
        await pollService.deletePoll(id);
        setAlert({ type: 'success', message: 'Poll deleted successfully.' });
        fetchPolls();
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to delete poll.' });
      }
    }
  };

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Polls</h1>
            <p className="page-subtitle">Create, monitor, publish, and evaluate community polls.</p>
          </div>
          <Link to="/admin/polls/create" className="btn btn-primary">
            ➕ Create New Poll
          </Link>
        </div>

        {alert.message && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        <div className="card">
          {loading ? (
            <LoadingSpinner message="Loading polls..." />
          ) : polls.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
              No polls found. Click "Create New Poll" to start your first poll.
            </p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Question / Title</th>
                    <th>Status</th>
                    <th>Options</th>
                    <th>Total Votes</th>
                    <th>Status Action</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {polls.map((poll) => (
                    <tr key={poll.id}>
                      <td>#{poll.id}</td>
                      <td style={{ fontWeight: 600, maxWidth: '280px' }}>{poll.title}</td>
                      <td>
                        <span className={`status-badge status-${poll.status.toLowerCase()}`}>
                          {poll.status}
                        </span>
                      </td>
                      <td>{poll.options?.length || 0} options</td>
                      <td style={{ fontWeight: 700 }}>{poll.totalVotes || 0}</td>
                      <td>
                        {poll.status === 'DRAFT' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusChange(poll.id, 'PUBLISHED')}
                          >
                            Publish ▶
                          </button>
                        )}
                        {poll.status === 'PUBLISHED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStatusChange(poll.id, 'CLOSED')}
                          >
                            Close ⏹
                          </button>
                        )}
                        {poll.status === 'CLOSED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStatusChange(poll.id, 'PUBLISHED')}
                          >
                            Reopen ↺
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/admin/polls/${poll.id}/analytics`}
                            className="btn btn-secondary btn-sm"
                            title="View Results"
                          >
                            Results 📊
                          </Link>
                          <Link
                            to={`/admin/polls/${poll.id}/edit`}
                            className="btn btn-secondary btn-sm"
                            title="Edit Poll"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(poll.id, poll.title)}
                            title="Delete Poll"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePolls;
