import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { surveyService } from '../../services/surveyService';

const ManageQuestions = () => {
  const { id } = useParams(); // surveyId

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Add/Edit Question Form State
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [options, setOptions] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  const fetchSurvey = async () => {
    try {
      const data = await surveyService.getSurveyById(id);
      setSurvey(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load survey questions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const handleAddOptionField = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOptionField = (index) => {
    if (options.length <= 2) {
      setAlert({ type: 'error', message: 'At least 2 options are required for choice questions.' });
      return;
    }
    const updated = options.filter((_, idx) => idx !== index);
    setOptions(updated);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setQuestionType('MULTIPLE_CHOICE');
    setOptions(['', '']);
  };

  const handleEditClick = (q) => {
    setEditingQuestionId(q.id);
    setQuestionText(q.questionText);
    setQuestionType(q.questionType);
    if (q.questionType === 'TEXT') {
      setOptions(['', '']);
    } else {
      setOptions(q.options?.map((opt) => opt.optionText) || ['', '']);
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? Any existing answers will also be removed.')) {
      try {
        await surveyService.deleteQuestion(questionId);
        setAlert({ type: 'success', message: 'Question deleted successfully.' });
        fetchSurvey();
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to delete question.' });
      }
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!questionText.trim()) {
      setAlert({ type: 'error', message: 'Question text is required.' });
      return;
    }

    let formattedOptions = [];
    if (questionType !== 'TEXT') {
      const validOptions = options.map((opt) => opt.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        setAlert({ type: 'error', message: 'Please provide at least 2 non-empty options.' });
        return;
      }
      formattedOptions = validOptions.map((opt) => ({ optionText: opt }));
    }

    const payload = {
      questionText: questionText.trim(),
      questionType,
      options: formattedOptions,
    };

    try {
      setSubmitting(true);
      if (editingQuestionId) {
        await surveyService.updateQuestion(editingQuestionId, payload);
        setAlert({ type: 'success', message: 'Question updated successfully!' });
      } else {
        await surveyService.addQuestion(id, payload);
        setAlert({ type: 'success', message: 'New question added successfully!' });
      }
      resetForm();
      fetchSurvey();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save question.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout-wrapper">
        <Sidebar />
        <div className="admin-page-content">
          <LoadingSpinner message="Loading survey questions..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content" style={{ maxWidth: '900px' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Questions</h1>
            <p className="page-subtitle">Survey: <strong>{survey?.title}</strong></p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/surveys" className="btn btn-secondary btn-sm">
              ← Back to Surveys
            </Link>
            <Link to={`/admin/surveys/${id}/analytics`} className="btn btn-primary btn-sm">
              View Analytics 📊
            </Link>
          </div>
        </div>

        {alert.message && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        {/* Existing Questions List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Current Questions ({survey?.questions?.length || 0})</h2>
          </div>

          {survey?.questions?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
              No questions added yet. Use the form below to add questions to this survey.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {survey?.questions?.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span className="question-number">{idx + 1}</span>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{q.questionText}</h3>
                        <span className="question-type-tag">
                          {q.questionType === 'MULTIPLE_CHOICE' && 'Single Choice'}
                          {q.questionType === 'CHECKBOX' && 'Checkbox (Multiple Select)'}
                          {q.questionType === 'TEXT' && 'Text Response'}
                        </span>
                      </div>
                    </div>

                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditClick(q)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {q.questionType !== 'TEXT' && q.options && q.options.length > 0 && (
                    <ul style={{ margin: '0.75rem 0 0 2.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {q.options.map((opt) => (
                        <li key={opt.id} style={{ marginBottom: '0.25rem' }}>
                          • {opt.optionText}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add / Edit Question Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {editingQuestionId ? 'Edit Question' : '➕ Add New Question'}
            </h2>
            {editingQuestionId && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleQuestionSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="questionText">Question Text *</label>
              <input
                id="questionText"
                type="text"
                className="form-control"
                placeholder="e.g. How satisfied are you with our services?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="questionType">Question Type *</label>
              <select
                id="questionType"
                className="form-control"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice (Single Answer Radio)</option>
                <option value="CHECKBOX">Checkbox (Multiple Answers Allowed)</option>
                <option value="TEXT">Text Answer (Paragraph / Open Response)</option>
              </select>
            </div>

            {/* Answer Options (for Choice and Checkbox questions) */}
            {questionType !== 'TEXT' && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label">Answer Options (Minimum 2)</label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddOptionField}
                  >
                    ➕ Add Option
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {options.map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', width: '20px' }}>
                        {oIdx + 1}.
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                        required
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveOptionField(oIdx)}
                          title="Remove Option"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.75rem' }}>
              {editingQuestionId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : editingQuestionId
                  ? 'Update Question'
                  : 'Add Question to Survey'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageQuestions;
