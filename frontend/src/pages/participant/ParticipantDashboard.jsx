import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { surveyService } from '../../services/surveyService';
import { pollService } from '../../services/pollService';
import { userService } from '../../services/userService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import PollSphereHero from '../../components/PollSphereHero';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [polls, setPolls] = useState([]);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeSurveys, activePolls, userHistory] = await Promise.all([
          surveyService.getActiveSurveys(),
          pollService.getActivePolls(),
          userService.getMyHistory(),
        ]);
        setSurveys(activeSurveys);
        setPolls(activePolls);
        setHistory(userHistory);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const completedSurveysCount = history?.totalSurveysParticipated || 0;
  const votedPollsCount = history?.totalPollsVoted || 0;

  return (
    <div className="participant-page-content">
      <PollSphereHero />

      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}! 👋</h1>
          <p className="page-subtitle">Participate in open campus surveys and cast your votes in active polls.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Active Surveys"
          value={surveys.length}
          subtitle="Open for responses"
          icon="📋"
          color="blue"
        />
        <StatCard
          title="Active Polls"
          value={polls.length}
          subtitle="Open for voting"
          icon="🗳️"
          color="indigo"
        />
        <StatCard
          title="Surveys Completed"
          value={completedSurveysCount}
          subtitle="Your submitted surveys"
          icon="✅"
          color="green"
        />
        <StatCard
          title="Polls Voted"
          value={votedPollsCount}
          subtitle="Your submitted votes"
          icon="⭐"
          color="amber"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
        {/* Active Surveys Preview */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Featured Surveys</h2>
            <Link to="/surveys" className="btn btn-secondary btn-sm">
              View All ({surveys.length})
            </Link>
          </div>

          {surveys.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No active surveys available at the moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {surveys.slice(0, 3).map((survey) => (
                <div key={survey.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{survey.title}</h3>
                    {survey.hasParticipated && (
                      <span className="status-badge status-published">Completed</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {survey.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {survey.questions?.length || 0} Questions
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/surveys/${survey.id}/results`} className="btn btn-secondary btn-sm">
                        Results
                      </Link>
                      {survey.hasParticipated ? (
                        <button className="btn btn-secondary btn-sm" disabled>
                          Submitted ✓
                        </button>
                      ) : (
                        <Link to={`/surveys/${survey.id}`} className="btn btn-primary btn-sm">
                          Take Survey →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Polls Preview */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Active Polls</h2>
            <Link to="/polls" className="btn btn-secondary btn-sm">
              View All ({polls.length})
            </Link>
          </div>

          {polls.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No active polls available at the moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {polls.slice(0, 3).map((poll) => (
                <div key={poll.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{poll.title}</h3>
                    {poll.hasVoted && (
                      <span className="status-badge status-published">Voted</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {poll.description || 'Cast your quick vote.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {poll.totalVotes || 0} Total Votes
                    </span>
                    <Link to={`/polls/${poll.id}`} className="btn btn-primary btn-sm">
                      {poll.hasVoted ? 'View Results' : 'Vote Now →'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
