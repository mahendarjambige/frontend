import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pollService } from '../../services/pollService';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const VotePoll = () => {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const data = await pollService.getPollById(id);
        setPoll(data);
        if (data.hasVoted && data.selectedOptionId) {
          setSelectedOption(data.selectedOptionId);
        }
      } catch (err) {
        setError('Failed to load poll details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [id]);

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedOption) {
      setError('Please select an option to cast your vote.');
      return;
    }

    try {
      setSubmitting(true);
      const updated = await pollService.voteInPoll(id, selectedOption);
      setPoll(updated);
      setSuccessMsg('Your vote was recorded successfully! View live results below.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit vote. You may have already voted.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading poll..." />;
  }

  if (!poll) {
    return (
      <div className="participant-page-content">
        <AlertMessage type="error" message="Poll not found." />
        <Link to="/polls" className="btn btn-secondary">← Back to Polls</Link>
      </div>
    );
  }

  return (
    <div className="participant-page-content" style={{ maxWidth: '750px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/polls" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Back to Active Polls
        </Link>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      {successMsg && <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }}>{poll.title}</h1>
          <span className={`status-badge ${poll.hasVoted ? 'status-published' : 'status-draft'}`}>
            {poll.hasVoted ? 'Voted ✓' : 'Voting Open'}
          </span>
        </div>

        {poll.description && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{poll.description}</p>
        )}

        <div className="result-stat-summary">
          <div className="result-stat-item">
            <span className="result-stat-label">Total Votes Cast</span>
            <span className="result-stat-val">{poll.totalVotes || 0}</span>
          </div>
          <div className="result-stat-item">
            <span className="result-stat-label">Options Available</span>
            <span className="result-stat-val">{poll.options?.length || 0}</span>
          </div>
          <div className="result-stat-item">
            <span className="result-stat-label">Your Status</span>
            <span className="result-stat-val" style={{ fontSize: '1.1rem', color: poll.hasVoted ? 'var(--success-text)' : 'var(--primary)' }}>
              {poll.hasVoted ? 'Vote Submitted' : 'Eligible to Vote'}
            </span>
          </div>
        </div>

        {/* If user HAS voted: Show live results with percentages */}
        {poll.hasVoted ? (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Live Poll Results:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {poll.options?.map((opt) => {
                const isUserChoice = opt.id === poll.selectedOptionId;
                return (
                  <div
                    key={opt.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isUserChoice ? 'var(--primary-light)' : '#f8fafc',
                      border: isUserChoice ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: isUserChoice ? 700 : 500, fontSize: '1rem' }}>
                        {opt.optionText} {isUserChoice && <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>(Your Vote)</span>}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                        {opt.voteCount || 0} votes ({opt.percentage || 0}%)
                      </span>
                    </div>
                    <ProgressBar
                      percentage={opt.percentage || 0}
                      color={isUserChoice ? 'primary' : 'success'}
                      showLabel={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* If user HAS NOT voted: Show voting form */
          <form onSubmit={handleVoteSubmit}>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Select your choice:</p>
            <div className="options-container" style={{ marginBottom: '1.5rem' }}>
              {poll.options?.map((opt) => (
                <label
                  key={opt.id}
                  className={`option-label ${selectedOption === opt.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="poll_option"
                    value={opt.id}
                    checked={selectedOption === opt.id}
                    onChange={() => setSelectedOption(opt.id)}
                  />
                  <span>{opt.optionText}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Link to="/polls" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !selectedOption}
              >
                {submitting ? 'Submitting Vote...' : 'Submit Vote 🗳️'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VotePoll;
