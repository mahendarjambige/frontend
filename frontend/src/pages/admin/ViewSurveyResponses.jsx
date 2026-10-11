import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { surveyService } from '../../services/surveyService';

const ViewSurveyResponses = () => {
  const { id } = useParams(); // surveyId

  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyData, responseList] = await Promise.all([
          surveyService.getSurveyById(id),
          surveyService.getSurveyResponses(id),
        ]);
        setSurvey(surveyData);
        setResponses(responseList);
      } catch (err) {
        setError('Failed to load submitted survey responses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-layout-wrapper">
        <Sidebar />
        <div className="admin-page-content">
          <LoadingSpinner message="Loading submitted responses..." />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-wrapper">
      <Sidebar />
      <div className="admin-page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Submitted Responses</h1>
            <p className="page-subtitle">Survey: <strong>{survey?.title}</strong></p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/surveys" className="btn btn-secondary btn-sm">
              ← Back to Surveys
            </Link>
            <Link to={`/admin/surveys/${id}/analytics`} className="btn btn-primary btn-sm">
              Analytics 📊
            </Link>
          </div>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        <div className="result-stat-summary" style={{ marginBottom: '1.5rem' }}>
          <div className="result-stat-item">
            <span className="result-stat-label">Total Submissions</span>
            <span className="result-stat-val">{responses.length}</span>
          </div>
          <div className="result-stat-item">
            <span className="result-stat-label">Survey Status</span>
            <span className="result-stat-val" style={{ fontSize: '1.1rem' }}>
              <span className={`status-badge status-${survey?.status?.toLowerCase()}`}>
                {survey?.status}
              </span>
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Participant Submissions ({responses.length})</h2>
          </div>

          {responses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
              No responses have been submitted for this survey yet.
            </p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Response ID</th>
                    <th>Participant Name</th>
                    <th>Email</th>
                    <th>Submitted At</th>
                    <th>Answers Count</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((resp) => (
                    <tr key={resp.responseId}>
                      <td>#{resp.responseId}</td>
                      <td style={{ fontWeight: 600 }}>{resp.userName}</td>
                      <td>{resp.userEmail}</td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {resp.submittedAt ? new Date(resp.submittedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td>{resp.answers?.length || 0}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedResponse(resp)}
                        >
                          View Answers 👁️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal / Detailed Answers Drawer */}
        {selectedResponse && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    Submission by {selectedResponse.userName}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedResponse.userEmail} • Submitted {new Date(selectedResponse.submittedAt).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedResponse(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {selectedResponse.answers?.map((ans, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      background: '#f8fafc',
                    }}
                  >
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                      Q{idx + 1}: {ans.questionText}
                    </p>
                    {ans.optionText ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Selected:</span>
                        <span className="role-badge role-participant" style={{ fontSize: '0.85rem', padding: '3px 8px' }}>
                          {ans.optionText}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Written Response:</span>
                        <p style={{ marginTop: '0.25rem', fontStyle: 'italic', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                          "{ans.textAnswer || 'No answer provided'}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedResponse(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSurveyResponses;
