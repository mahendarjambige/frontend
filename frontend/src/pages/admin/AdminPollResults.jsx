import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { pollService } from '../../services/pollService';

const AdminPollResults = () => {
  const { id } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await pollService.getPollResults(id);
        setResult(data);
      } catch (err) {
        setError('Failed to compute poll results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-layout-wrapper">
        <Sidebar />
        <div className="admin-page-content">
          <LoadingSpinner message="Calculating poll results..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content" style={{ maxWidth: '850px' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Poll Analytics & Results</h1>
            <p className="page-subtitle">Voting breakdown for community poll.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/polls" className="btn btn-secondary btn-sm">
              ← Back to Polls
            </Link>
            <Link to={`/admin/polls/${id}/edit`} className="btn btn-secondary btn-sm">
              Edit Poll
            </Link>
          </div>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        <div className="card">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {result?.pollTitle}
          </h2>
          {result?.pollDescription && (
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {result.pollDescription}
            </p>
          )}

          <div className="result-stat-summary">
            <div className="result-stat-item">
              <span className="result-stat-label">Total Votes</span>
              <span className="result-stat-val">{result?.totalVotes || 0}</span>
            </div>
            <div className="result-stat-item">
              <span className="result-stat-label">Options Count</span>
              <span className="result-stat-val">{result?.options?.length || 0}</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '1.5rem 0 1rem 0' }}>
            Option Vote Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {result?.options?.map((opt, idx) => (
              <div
                key={opt.id || idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{opt.optionText}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {opt.voteCount} votes ({opt.percentage}%)
                  </span>
                </div>
                <ProgressBar
                  percentage={opt.percentage}
                  color={idx === 0 ? 'primary' : 'success'}
                  showLabel={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Results Table</h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>Votes Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {result?.options?.map((opt, idx) => (
                  <tr key={opt.id || idx}>
                    <td style={{ fontWeight: 600 }}>{opt.optionText}</td>
                    <td>{opt.voteCount}</td>
                    <td style={{ fontWeight: 700 }}>{opt.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPollResults;
