import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PollSphereHero = ({ onExplorePolls, onCreateSurvey }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleExplorePolls = () => {
    if (onExplorePolls) {
      onExplorePolls();
    } else {
      navigate('/polls');
    }
  };

  const handleCreateSurvey = () => {
    if (onCreateSurvey) {
      onCreateSurvey();
    } else {
      navigate('/admin/surveys/create');
    }
  };

  return (
    <div className="pollsphere-hero-wrapper">
      {/* Brand Header */}
      <div className="pollsphere-brand-badge">
        <div className="pollsphere-logo-icon">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
            <path d="M3 14l5-5 4 4 8-8" />
            <path d="M16 5h4v4" />
          </svg>
        </div>
        <span className="pollsphere-brand-title">PollSphere</span>
      </div>

      {/* Main Headline */}
      <h1 className="pollsphere-hero-headline">
        Your Voice. Your Vote. Your Impact.
      </h1>

      {/* Subtitle */}
      <p className="pollsphere-hero-subtitle">
        Create surveys, vote in polls, share your opinions, and discover what people think.
      </p>

      {/* Action Buttons */}
      <div className="pollsphere-hero-actions">
        <button
          type="button"
          className="btn-pollsphere-primary"
          onClick={handleExplorePolls}
        >
          Explore Polls
        </button>

        {/* 'Create Survey' is strictly reserved for ADMIN ONLY in the interface */}
        {isAdmin ? (
          <button
            type="button"
            className="btn-pollsphere-secondary"
            onClick={handleCreateSurvey}
          >
            ➕ Create Survey
          </button>
        ) : (
          <button
            type="button"
            className="btn-pollsphere-secondary"
            onClick={() => navigate('/surveys')}
          >
            Browse Surveys
          </button>
        )}
      </div>
    </div>
  );
};

export default PollSphereHero;
