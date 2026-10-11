import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollService } from '../../services/pollService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const AvailablePolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await pollService.getActivePolls();
        setPolls(data);
      } catch (err) {
        setError('Failed to load polls. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading available polls..." />;
  }

  return (
    <div className="participant-page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Active Polls</h1>
          <p className="page-subtitle">Cast your vote on campus community questions. Single vote per participant.</p>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      {polls.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗳️</div>
          <h3>No Active Polls</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are currently no active polls running.</p>
        </div>
      ) : (
        <div className="items-grid">
          {polls.map((poll) => (
            <div key={poll.id} className="item-card">
              <div className="item-card-header">
                <h3 className="item-card-title">{poll.title}</h3>
                {poll.hasVoted ? (
                  <span className="status-badge status-published">Voted ✓</span>
                ) : (
                  <span className="status-badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>Active</span>
                )}
              </div>

              <p className="item-card-desc">
                {poll.description || 'Participate and view community opinion.'}
              </p>

              <div className="item-card-meta">
                <span>🔘 {poll.options?.length || 0} Options</span>
                <span>🗳️ {poll.totalVotes || 0} Total Votes</span>
              </div>

              <div className="item-card-actions">
                <Link to={`/polls/${poll.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  {poll.hasVoted ? 'View Poll Results 📊' : 'Vote Now →'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailablePolls;
