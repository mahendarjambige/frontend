import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const MyHistory = () => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await userService.getMyHistory();
        setHistory(data);
      } catch (err) {
        setError('Failed to load participation history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your activity history..." />;
  }

  return (
    <div className="participant-page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Participation History</h1>
          <p className="page-subtitle">Track your completed surveys and submitted poll votes.</p>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      <div className="result-stat-summary" style={{ marginBottom: '2rem' }}>
        <div className="result-stat-item">
          <span className="result-stat-label">Surveys Completed</span>
          <span className="result-stat-val">{history?.totalSurveysParticipated || 0}</span>
        </div>
        <div className="result-stat-item">
          <span className="result-stat-label">Polls Voted</span>
          <span className="result-stat-val">{history?.totalPollsVoted || 0}</span>
        </div>
      </div>

      {/* Completed Surveys Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Completed Surveys</h2>
        </div>

        {history?.surveys?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
            You haven't participated in any surveys yet. <Link to="/surveys" style={{ color: 'var(--primary)', fontWeight: 600 }}>Explore surveys</Link>
          </p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Survey Title</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history?.surveys?.map((item) => (
                  <tr key={item.responseId}>
                    <td style={{ fontWeight: 600 }}>{item.surveyTitle}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                      <span className="status-badge status-published">Completed</span>
                    </td>
                    <td>
                      <Link to={`/surveys/${item.surveyId}/results`} className="btn btn-secondary btn-sm">
                        View Results 📊
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Voted Polls Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Poll Votes</h2>
        </div>

        {history?.polls?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
            You haven't cast any votes yet. <Link to="/polls" style={{ color: 'var(--primary)', fontWeight: 600 }}>Explore polls</Link>
          </p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Poll Question</th>
                  <th>Your Choice</th>
                  <th>Voted At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history?.polls?.map((item) => (
                  <tr key={item.voteId}>
                    <td style={{ fontWeight: 600 }}>{item.pollTitle}</td>
                    <td>
                      <span className="role-badge role-participant" style={{ fontSize: '0.8rem', padding: '2px 8px' }}>
                        {item.votedOptionText}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {item.votedAt ? new Date(item.votedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                      <Link to={`/polls/${item.pollId}`} className="btn btn-secondary btn-sm">
                        Live Results 📊
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHistory;
