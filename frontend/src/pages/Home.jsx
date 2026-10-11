import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PollSphereHero from '../components/PollSphereHero';
import { surveyService } from '../services/surveyService';
import { pollService } from '../services/pollService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [activeSurveys, activePolls] = await Promise.all([
          surveyService.getActiveSurveys(),
          pollService.getActivePolls(),
        ]);
        setSurveys(activeSurveys || []);
        setPolls(activePolls || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="participant-page-content" style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* PollSphere Hero Banner */}
      <PollSphereHero
        onExplorePolls={() => scrollToSection('polls-section')}
      />

      {loading ? (
        <LoadingSpinner message="Loading live polls & surveys..." />
      ) : (
        <>
          {/* Quick Highlight Stats */}
          <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
            <div className="stat-card stat-blue">
              <div className="stat-icon-wrapper">📊</div>
              <div>
                <div className="stat-title">Available Polls</div>
                <div className="stat-value">{polls.length}</div>
                <div className="stat-subtitle">Ready for instant voting</div>
              </div>
            </div>

            <div className="stat-card stat-indigo">
              <div className="stat-icon-wrapper">📋</div>
              <div>
                <div className="stat-title">Active Surveys</div>
                <div className="stat-value">{surveys.length}</div>
                <div className="stat-subtitle">Comprehensive community questions</div>
              </div>
            </div>

            <div className="stat-card stat-green">
              <div className="stat-icon-wrapper">🔒</div>
              <div>
                <div className="stat-title">Secure & Fair</div>
                <div className="stat-value">100%</div>
                <div className="stat-subtitle">Single-Admin tamper-proof voting</div>
              </div>
            </div>

            <div className="stat-card stat-amber">
              <div className="stat-icon-wrapper">⚡</div>
              <div>
                <div className="stat-title">Live Results</div>
                <div className="stat-value">Instant</div>
                <div className="stat-subtitle">Real-time percentage analytics</div>
              </div>
            </div>
          </div>

          {/* Active Polls Section */}
          <div id="polls-section" style={{ marginBottom: '3rem' }}>
            <div className="card-header" style={{ marginBottom: '1.25rem', borderBottom: 'none' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  🗳️ Trending Community Polls
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Cast your quick vote and see real-time community opinions.
                </p>
              </div>
              <Link to="/polls" className="btn btn-secondary btn-sm">
                View All Polls ({polls.length}) →
              </Link>
            </div>

            {polls.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                No active polls at the moment. Check back soon!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {polls.slice(0, 3).map((poll) => (
                  <div key={poll.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="status-badge status-published">Active Poll</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {poll.totalVotes || 0} votes
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                        {poll.title}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        {poll.description || 'Quick poll question. Voice your choice today.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {poll.options?.length || 0} options
                      </span>
                      <Link
                        to={isAuthenticated ? `/polls/${poll.id}` : '/login'}
                        className="btn btn-primary btn-sm"
                      >
                        {poll.hasVoted ? 'View Results 📊' : 'Vote Now 🗳️'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Surveys Section */}
          <div id="surveys-section" style={{ marginBottom: '3rem' }}>
            <div className="card-header" style={{ marginBottom: '1.25rem', borderBottom: 'none' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  📋 Featured Surveys
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Share detailed insights and contribute to campus decisions.
                </p>
              </div>
              <Link to="/surveys" className="btn btn-secondary btn-sm">
                View All Surveys ({surveys.length}) →
              </Link>
            </div>

            {surveys.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                No active surveys available currently.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {surveys.slice(0, 3).map((survey) => (
                  <div key={survey.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <span className="status-badge status-published">Open Survey</span>
                        {survey.hasParticipated && (
                          <span className="status-badge status-published" style={{ background: '#ecfdf5', color: '#047857' }}>
                            Completed ✓
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                        {survey.title}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        {survey.description || 'Provide your honest feedback to help improve facilities and policies.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {survey.questions?.length || 0} Questions
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={isAuthenticated ? `/surveys/${survey.id}/results` : '/login'}
                          className="btn btn-secondary btn-sm"
                        >
                          Results
                        </Link>
                        {survey.hasParticipated ? (
                          <button className="btn btn-secondary btn-sm" disabled>
                            Submitted ✓
                          </button>
                        ) : (
                          <Link
                            to={isAuthenticated ? `/surveys/${survey.id}` : '/login'}
                            className="btn btn-primary btn-sm"
                          >
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

          {/* Platform Features Grid */}
          <div className="card" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                Why Choose PollSphere?
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                A reliable, role-protected online survey and polling platform designed for students, administrators, and teams.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>🔒</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>Single-Admin Security</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Strict role enforcement ensures exactly one designated admin oversees surveys, keeping responses tamper-free.
                </p>
              </div>

              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>📊</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>Instant Percentage Analytics</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  View live vote distributions, question answers, and statistical percentages in clear tables and visual bars.
                </p>
              </div>

              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>⚡</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>One-Vote Guarantee</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Unique database constraints prevent duplicate voting, giving every participant an honest voice.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
