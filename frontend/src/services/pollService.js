import api from './api';

export const pollService = {
  // Participant & Public
  getActivePolls: async () => {
    const response = await api.get('/polls/active');
    return response.data;
  },

  getPollById: async (id) => {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  },

  voteInPoll: async (pollId, optionId) => {
    const response = await api.post(`/polls/${pollId}/vote`, { optionId });
    return response.data;
  },

  getPollResults: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/results`);
    return response.data;
  },

  // Admin Operations
  getAllPolls: async () => {
    const response = await api.get('/admin/polls');
    return response.data;
  },

  createPoll: async (pollData) => {
    const response = await api.post('/admin/polls', pollData);
    return response.data;
  },

  updatePoll: async (id, pollData) => {
    const response = await api.put(`/admin/polls/${id}`, pollData);
    return response.data;
  },

  updatePollStatus: async (id, status) => {
    const response = await api.patch(`/admin/polls/${id}/status`, { status });
    return response.data;
  },

  deletePoll: async (id) => {
    const response = await api.delete(`/admin/polls/${id}`);
    return response.data;
  },
};
