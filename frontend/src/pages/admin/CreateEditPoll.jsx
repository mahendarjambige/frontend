import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { pollService } from '../../services/pollService';

const CreateEditPoll = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    if (isEditMode) {
      const fetchPoll = async () => {
        try {
          const data = await pollService.getPollById(id);
          setTitle(data.title || '');
          setDescription(data.description || '');
          setStatus(data.status || 'DRAFT');
          if (data.options && data.options.length > 0) {
            setOptions(data.options.map((o) => o.optionText));
          }
        } catch (err) {
          setAlert({ type: 'error', message: 'Failed to load poll data.' });
        } finally {
          setLoading(false);
        }
      };
      fetchPoll();
    }
  }, [id, isEditMode]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setAlert({ type: 'error', message: 'A poll must have at least 2 options.' });
      return;
    }
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!title.trim()) {
      setAlert({ type: 'error', message: 'Poll question/title is required.' });
      return;
    }

    const validOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      setAlert({ type: 'error', message: 'Please provide at least 2 distinct poll options.' });
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      options: validOptions.map((opt) => ({ optionText: opt })),
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await pollService.updatePoll(id, payload);
        setAlert({ type: 'success', message: 'Poll updated successfully!' });
      } else {
        await pollService.createPoll(payload);
        setAlert({ type: 'success', message: 'Poll created successfully!' });
      }
      setTimeout(() => navigate('/admin/polls'), 800);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save poll.';
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
          <LoadingSpinner message="Loading poll information..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">{isEditMode ? 'Edit Poll' : 'Create New Poll'}</h1>
            <p className="page-subtitle">Configure poll question, options, and status.</p>
          </div>
          <Link to="/admin/polls" className="btn btn-secondary btn-sm">
            ← Back to Polls
          </Link>
        </div>

        {alert.message && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ type: '', message: '' })}
          />
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Poll Question / Title *</label>
              <input
                id="title"
                type="text"
                className="form-control"
                placeholder="e.g. Which programming language is best for web backend?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                className="form-control"
                placeholder="Add context or notes about this poll..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">Poll Status</label>
              <select
                id="status"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="PUBLISHED">Published (Open for voting)</option>
                <option value="CLOSED">Closed (Archived)</option>
              </select>
            </div>

            {/* Dynamic Poll Options */}
            <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label className="form-label">Poll Options (Minimum 2)</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddOption}
                >
                  ➕ Add Option
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', width: '24px' }}>
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemoveOption(idx)}
                        title="Remove Option"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/admin/polls" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Poll'
                  : 'Create & Publish Poll'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEditPoll;
