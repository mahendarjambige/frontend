import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { userService } from '../../services/userService';
import { surveyService } from '../../services/surveyService';
import { pollService } from '../../services/pollService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dashStats, allSurveys, allPolls] = await Promise.all([
          userService.getDashboardStats(),
          surveyService.getAllSurveys(),
          pollService.getAllPolls(),
        ]);
        setStats(dashStats);
        setSurveys(allSurveys);
        setPolls(allPolls);
      } catch (err) {
        setError('Failed to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="admin-layout-wrapper">
        <Sidebar />
        <div className="admin-page-content">
          <LoadingSpinner message="Loading admin overview..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Monitor survey submissions, poll votes, and platform activity.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/surveys/create" className="btn btn-primary btn-sm">
              ➕ Create Survey
            </Link>
            <Link to="/admin/polls/create" className="btn btn-secondary btn-sm">
              ➕ Create Poll
            </Link>
          </div>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        {/* Dashboard Stat Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Surveys"
            value={stats?.totalSurveys || 0}
            subtitle={`${stats?.activeSurveys || 0} currently active`}
            icon="📋"
            color="blue"
          />
          <StatCard
            title="Total Polls"
            value={stats?.totalPolls || 0}
            subtitle={`${stats?.activePolls || 0} currently active`}
            icon="🗳️"
            color="indigo"
          />
          <StatCard
            title="Total Responses"
            value={stats?.totalResponses || 0}
            subtitle="Survey answers recorded"
            icon="💬"
            color="green"
          />
          <StatCard
            title="Registered Users"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.totalParticipants || 0} participants, ${stats?.totalAdmins || 0} admins`}
            icon="👥"
            color="amber"
          />
        </div>

        {/* Recent Surveys Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Surveys</h2>
            <Link to="/admin/surveys" className="btn btn-secondary btn-sm">
              Manage All Surveys ({surveys.length})
            </Link>
          </div>

          {surveys.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No surveys created yet.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Questions</th>
                    <th>Responses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.slice(0, 5).map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.title}</td>
                      <td>
                        <span className={`status-badge status-${s.status.toLowerCase()}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>{s.questions?.length || 0}</td>
                      <td>{s.totalResponses || 0}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/admin/surveys/${s.id}/responses`} className="btn btn-secondary btn-sm">
                            Responses
                          </Link>
                          <Link to={`/admin/surveys/${s.id}/analytics`} className="btn btn-secondary btn-sm">
                            Results
                          </Link>
                          <Link to={`/admin/surveys/${s.id}/questions`} className="btn btn-outline-primary btn-sm">
                            Questions
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Polls Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Polls</h2>
            <Link to="/admin/polls" className="btn btn-secondary btn-sm">
              Manage All Polls ({polls.length})
            </Link>
          </div>

          {polls.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No polls created yet.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Question / Title</th>
                    <th>Status</th>
                    <th>Options</th>
                    <th>Total Votes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {polls.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td>
                        <span className={`status-badge status-${p.status.toLowerCase()}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.options?.length || 0}</td>
                      <td>{p.totalVotes || 0}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/admin/polls/${p.id}/analytics`} className="btn btn-secondary btn-sm">
                            Results
                          </Link>
                          <Link to={`/admin/polls/${p.id}/edit`} className="btn btn-outline-primary btn-sm">
                            Edit
                          </Link>
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

export default AdminDashboard;
