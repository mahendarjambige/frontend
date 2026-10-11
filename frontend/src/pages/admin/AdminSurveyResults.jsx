import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { surveyService } from '../../services/surveyService';

const AdminSurveyResults = () => {
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
        setError('Failed to compute survey results.');
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
          <LoadingSpinner message="Generating survey analytics..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content" style={{ maxWidth: '950px' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Survey Analytics & Results</h1>
            <p className="page-subtitle">Aggregate metrics for: <strong>{result?.surveyTitle}</strong></p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/surveys" className="btn btn-secondary btn-sm">
              ← Back to Surveys
            </Link>
            <Link to={`/admin/surveys/${id}/responses`} className="btn btn-secondary btn-sm">
              View Raw Responses ({result?.totalResponses || 0})
            </Link>
          </div>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        <div className="stats-grid">
          <div className="stat-card stat-card-blue">
            <span className="stat-card-title">Total Responses</span>
            <h3 className="stat-card-value">{result?.totalResponses || 0}</h3>
            <span className="stat-card-subtitle">Completed participant submissions</span>
          </div>

          <div className="stat-card stat-card-green">
            <span className="stat-card-title">Questions Analyzed</span>
            <h3 className="stat-card-value">{result?.questions?.length || 0}</h3>
            <span className="stat-card-subtitle">Survey fields evaluated</span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1.5rem 0 1rem 0' }}>
          Questions Data Breakdown
        </h2>

        {result?.questions?.map((q, idx) => (
          <div key={q.questionId} className="result-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
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
                  Received {q.textAnswers?.length || 0} textual response(s):
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
                    No text answers submitted yet.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {q.optionResults?.map((opt) => (
                  <div
                    key={opt.optionId}
                    style={{
                      background: '#f8fafc',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{opt.optionText}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {opt.count} votes ({opt.percentage}%)
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
    </div>
  );
};

export default AdminSurveyResults;
