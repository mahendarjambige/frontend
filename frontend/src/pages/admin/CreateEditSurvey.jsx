import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { surveyService } from '../../services/surveyService';

const CreateEditSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    if (isEditMode) {
      const fetchSurvey = async () => {
        try {
          const data = await surveyService.getSurveyById(id);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            status: data.status || 'DRAFT',
          });
        } catch (err) {
          setAlert({ type: 'error', message: 'Failed to load survey data.' });
        } finally {
          setLoading(false);
        }
      };
      fetchSurvey();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!formData.title.trim()) {
      setAlert({ type: 'error', message: 'Survey title cannot be empty.' });
      return;
    }

    try {
      setSubmitting(true);
      if (isEditMode) {
        await surveyService.updateSurvey(id, formData);
        setAlert({ type: 'success', message: 'Survey updated successfully!' });
        setTimeout(() => navigate('/admin/surveys'), 800);
      } else {
        const created = await surveyService.createSurvey(formData);
        setAlert({ type: 'success', message: 'Survey created successfully! Redirecting to add questions...' });
        setTimeout(() => navigate(`/admin/surveys/${created.id}/questions`), 800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save survey.';
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
          <LoadingSpinner message="Loading survey information..." />
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
            <h1 className="page-title">{isEditMode ? 'Edit Survey' : 'Create New Survey'}</h1>
            <p className="page-subtitle">
              {isEditMode
                ? 'Update survey details and timeline.'
                : 'Define survey objectives and configuration. You will add questions next.'}
            </p>
          </div>
          <Link to="/admin/surveys" className="btn btn-secondary btn-sm">
            ← Back to Surveys
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
              <label className="form-label" htmlFor="title">Survey Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-control"
                placeholder="e.g. Student Campus Facilities Survey 2026"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description / Instructions</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                placeholder="Briefly describe what this survey is about and how feedback will be used..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="startDate">Start Date</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endDate">End Date (Optional)</label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">Survey Status</label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="DRAFT">Draft (Hidden from participants)</option>
                  <option value="PUBLISHED">Published (Open for responses)</option>
                  <option value="CLOSED">Closed (Archived)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/admin/surveys" className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Survey Details'
                  : 'Save & Continue to Questions →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEditSurvey;
