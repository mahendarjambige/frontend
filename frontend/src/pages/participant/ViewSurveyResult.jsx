import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { surveyService } from '../../services/surveyService';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const ViewSurveyResult = () => {
  const { id } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await surveyService.getSurveyResults(id);
        setResult(data);
      } catch (err) {
        setError('Failed to load survey results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Calculating survey results..." />;
  }

  if (!result) {
    return (
      <div className="participant-page-content">
        <AlertMessage type="error" message="Survey results not found." />
        <Link to="/surveys" className="btn btn-secondary">← Back to Surveys</Link>
      </div>
    );
  }

  return (
    <div className="participant-page-content" style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/surveys" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Back to Available Surveys
        </Link>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      <div className="card">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {result.surveyTitle}
        </h1>
        {result.surveyDescription && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            {result.surveyDescription}
          </p>
        )}

        <div className="result-stat-summary">
          <div className="result-stat-item">
            <span className="result-stat-label">Total Submissions</span>
            <span className="result-stat-val">{result.totalResponses}</span>
          </div>
          <div className="result-stat-item">
            <span className="result-stat-label">Questions Evaluated</span>
            <span className="result-stat-val">{result.questions?.length || 0}</span>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
        Question Breakdown & Analytics
      </h2>

      {result.questions?.map((q, idx) => (
        <div key={q.questionId} className="result-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span className="question-number">{idx + 1}</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{q.questionText}</h3>
              <span className="question-type-tag">
                {q.questionType === 'MULTIPLE_CHOICE' && 'Single Choice Distribution'}
                {q.questionType === 'CHECKBOX' && 'Checkbox Multi-Select Distribution'}
                {q.questionType === 'TEXT' && 'Text Feedback Responses'}
              </span>
            </div>
          </div>

          {q.questionType === 'TEXT' ? (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Total written submissions: {q.textAnswers?.length || 0}
              </p>
              {q.textAnswers && q.textAnswers.length > 0 ? (
                <div className="text-answers-list">
                  {q.textAnswers.map((ans, aIdx) => (
                    <div key={aIdx} className="text-answer-item">
                      "{ans}"
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--text-light)', padding: '0.5rem 0' }}>
                  No text feedback submitted yet.
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {q.optionResults?.map((opt) => (
                <div key={opt.optionId} style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{opt.optionText}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {opt.count} {opt.count === 1 ? 'response' : 'responses'} ({opt.percentage}%)
                    </span>
                  </div>
                  <ProgressBar
                    percentage={opt.percentage}
                    color="primary"
                    showLabel={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ViewSurveyResult;
