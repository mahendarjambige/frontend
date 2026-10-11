import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surveyService } from '../../services/surveyService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const AvailableSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const data = await surveyService.getActiveSurveys();
        setSurveys(data);
      } catch (err) {
        setError('Failed to load surveys. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading available surveys..." />;
  }

  return (
    <div className="participant-page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Available Surveys</h1>
          <p className="page-subtitle">Browse and participate in active campus surveys.</p>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      {surveys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3>No Surveys Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>There are currently no active surveys published.</p>
        </div>
      ) : (
        <div className="items-grid">
          {surveys.map((survey) => (
            <div key={survey.id} className="item-card">
              <div className="item-card-header">
                <h3 className="item-card-title">{survey.title}</h3>
                {survey.hasParticipated ? (
                  <span className="status-badge status-published">Completed</span>
                ) : (
                  <span className="status-badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>Open</span>
                )}
              </div>

              <p className="item-card-desc">
                {survey.description || 'No description available.'}
              </p>

              <div className="item-card-meta">
                <span>📝 {survey.questions?.length || 0} Questions</span>
                <span>👥 {survey.totalResponses || 0} Responses</span>
              </div>

              <div className="item-card-actions">
                <Link to={`/surveys/${survey.id}/results`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  View Results
                </Link>
                {survey.hasParticipated ? (
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} disabled>
                    Answered ✓
                  </button>
                ) : (
                  <Link to={`/surveys/${survey.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    Take Survey →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableSurveys;
