import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { surveyService } from '../../services/surveyService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const TakeSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await surveyService.getSurveyById(id);
        setSurvey(data);

        if (data.hasParticipated) {
          setError('You have already submitted a response for this survey.');
        }
      } catch (err) {
        setError('Failed to load survey details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

  const handleMultipleChoiceChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, optionId },
    }));
  };

  const handleCheckboxChange = (questionId, optionId) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.selectedOptionIds || [];
      const updated = current.includes(optionId)
        ? current.filter((opt) => opt !== optionId)
        : [...current, optionId];

      return {
        ...prev,
        [questionId]: { questionId, selectedOptionIds: updated },
      };
    });
  };

  const handleTextChange = (questionId, textAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, textAnswer },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if at least some answers have been answered
    const formattedAnswers = Object.values(answers).filter((a) => {
      if (a.optionId) return true;
      if (a.selectedOptionIds && a.selectedOptionIds.length > 0) return true;
      if (a.textAnswer && a.textAnswer.trim().length > 0) return true;
      return false;
    });

    if (formattedAnswers.length === 0) {
      setError('Please answer at least one question before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      await surveyService.submitSurveyResponse(id, formattedAnswers);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit response. You may have already responded.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading survey questions..." />;
  }

  if (!survey) {
    return (
      <div className="participant-page-content">
        <AlertMessage type="error" message="Survey not found." />
        <Link to="/surveys" className="btn btn-secondary">← Back to Surveys</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="participant-page-content" style={{ maxWidth: '650px', textAlign: 'center', padding: '3rem 1rem' }}>
        <div className="card">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success-text)', marginBottom: '0.5rem' }}>
            Response Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Thank you for participating in <strong>{survey.title}</strong>. Your feedback has been recorded in the database.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to={`/surveys/${survey.id}/results`} className="btn btn-primary">
              View Survey Results 📊
            </Link>
            <Link to="/surveys" className="btn btn-secondary">
              Browse More Surveys
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="participant-page-content" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/surveys" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
          ← Back to Available Surveys
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{survey.title}</h1>
        {survey.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
            {survey.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
          <span>Total Questions: {survey.questions?.length || 0}</span>
          <span>Status: Open</span>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      {survey.hasParticipated ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>You have already submitted your response to this survey.</p>
          <Link to={`/surveys/${survey.id}/results`} className="btn btn-primary">
            View Live Results
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {survey.questions?.map((q, index) => (
            <div key={q.id} className="question-block">
              <div className="question-header">
                <span className="question-number">{index + 1}</span>
                <div>
                  <h3 className="question-title">{q.questionText}</h3>
                  <span className="question-type-tag">
                    {q.questionType === 'MULTIPLE_CHOICE' && 'Single Choice'}
                    {q.questionType === 'CHECKBOX' && 'Multiple Choice (Check all that apply)'}
                    {q.questionType === 'TEXT' && 'Written Answer'}
                  </span>
                </div>
              </div>

              {/* Multiple Choice (Single Selection) */}
              {q.questionType === 'MULTIPLE_CHOICE' && (
                <div className="options-container">
                  {q.options?.map((opt) => {
                    const isSelected = answers[q.id]?.optionId === opt.id;
                    return (
                      <label key={opt.id} className={`option-label ${isSelected ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => handleMultipleChoiceChange(q.id, opt.id)}
                        />
                        <span>{opt.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Checkbox (Multi Selection) */}
              {q.questionType === 'CHECKBOX' && (
                <div className="options-container">
                  {q.options?.map((opt) => {
                    const isChecked = (answers[q.id]?.selectedOptionIds || []).includes(opt.id);
                    return (
                      <label key={opt.id} className={`option-label ${isChecked ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          value={opt.id}
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(q.id, opt.id)}
                        />
                        <span>{opt.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Text Input */}
              {q.questionType === 'TEXT' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Type your response here..."
                    value={answers[q.id]?.textAnswer || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                  ></textarea>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/surveys" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              {submitting ? 'Submitting Responses...' : 'Submit Survey Responses ✓'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TakeSurvey;
