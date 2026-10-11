import api from './api';

export const surveyService = {
  // Participant & Public
  getActiveSurveys: async () => {
    const response = await api.get('/surveys/active');
    return response.data;
  },

  getSurveyById: async (id) => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  submitSurveyResponse: async (surveyId, answers) => {
    const response = await api.post(`/surveys/${surveyId}/submit`, {
      surveyId,
      answers,
    });
    return response.data;
  },

  getSurveyResults: async (surveyId) => {
    const response = await api.get(`/surveys/${surveyId}/results`);
    return response.data;
  },

  // Admin Operations
  getAllSurveys: async () => {
    const response = await api.get('/admin/surveys');
    return response.data;
  },

  createSurvey: async (surveyData) => {
    const response = await api.post('/admin/surveys', surveyData);
    return response.data;
  },

  updateSurvey: async (id, surveyData) => {
    const response = await api.put(`/admin/surveys/${id}`, surveyData);
    return response.data;
  },

  updateSurveyStatus: async (id, status) => {
    const response = await api.patch(`/admin/surveys/${id}/status`, { status });
    return response.data;
  },

  deleteSurvey: async (id) => {
    const response = await api.delete(`/admin/surveys/${id}`);
    return response.data;
  },

  addQuestion: async (surveyId, questionData) => {
    const response = await api.post(`/admin/surveys/${surveyId}/questions`, questionData);
    return response.data;
  },

  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/admin/questions/${questionId}`, questionData);
    return response.data;
  },

  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  },

  getSurveyResponses: async (surveyId) => {
    const response = await api.get(`/admin/surveys/${surveyId}/responses`);
    return response.data;
  },

  getResponseDetails: async (responseId) => {
    const response = await api.get(`/admin/responses/${responseId}`);
    return response.data;
  },
};
