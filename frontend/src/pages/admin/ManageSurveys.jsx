import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { surveyService } from '../../services/surveyService';

const ManageSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchSurveys = async () => {
    try {
      const data = await surveyService.getAllSurveys();
      setSurveys(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load surveys.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await surveyService.updateSurveyStatus(id, newStatus);
      setAlert({ type: 'success', message: `Survey status updated to ${newStatus} successfully.` });
      fetchSurveys();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update survey status.' });
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the survey "${title}"? All associated questions and responses will be permanently removed.`)) {
      try {
        await surveyService.deleteSurvey(id);
        setAlert({ type: 'success', message: 'Survey deleted successfully.' });
        fetchSurveys();
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to delete survey.' });
      }
    }
  };

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Manage Surveys</h1>
            <p className="page-subtitle">Create, publish, edit, and evaluate survey results.</p>
          </div>
          <Link to="/admin/surveys/create" className="btn btn-primary">
            ➕ Create New Survey
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
          {loading ? (
            <LoadingSpinner message="Loading surveys..." />
          ) : surveys.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
              No surveys found. Click "Create New Survey" to add your first survey.
            </p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Questions</th>
                    <th>Responses</th>
                    <th>Schedule</th>
                    <th>Status Action</th>
                    <th>Management Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((survey) => (
                    <tr key={survey.id}>
                      <td>#{survey.id}</td>
                      <td style={{ fontWeight: 600, maxWidth: '240px' }}>{survey.title}</td>
                      <td>
                        <span className={`status-badge status-${survey.status.toLowerCase()}`}>
                          {survey.status}
                        </span>
                      </td>
                      <td>{survey.questions?.length || 0}</td>
                      <td style={{ fontWeight: 600 }}>{survey.totalResponses || 0}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {survey.startDate || 'Immediate'} → {survey.endDate || 'No end'}
                      </td>
                      <td>
                        {survey.status === 'DRAFT' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleStatusChange(survey.id, 'PUBLISHED')}
                          >
                            Publish ▶
                          </button>
                        )}
                        {survey.status === 'PUBLISHED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStatusChange(survey.id, 'CLOSED')}
                          >
                            Close ⏹
                          </button>
                        )}
                        {survey.status === 'CLOSED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStatusChange(survey.id, 'PUBLISHED')}
                          >
                            Reopen ↺
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/admin/surveys/${survey.id}/questions`}
                            className="btn btn-secondary btn-sm"
                            title="Manage Questions"
                          >
                            Questions ({survey.questions?.length || 0})
                          </Link>
                          <Link
                            to={`/admin/surveys/${survey.id}/responses`}
                            className="btn btn-secondary btn-sm"
                            title="View Submissions"
                          >
                            Responses ({survey.totalResponses || 0})
                          </Link>
                          <Link
                            to={`/admin/surveys/${survey.id}/analytics`}
                            className="btn btn-secondary btn-sm"
                            title="View Aggregated Results"
                          >
                            Analytics
                          </Link>
                          <Link
                            to={`/admin/surveys/${survey.id}/edit`}
                            className="btn btn-secondary btn-sm"
                            title="Edit Survey Details"
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(survey.id, survey.title)}
                            title="Delete Survey"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSurveys;
