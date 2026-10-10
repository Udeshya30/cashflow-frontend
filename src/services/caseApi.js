import apiClient from './apiClient.js';

export const caseApi = {
  async listCases(params = {}) {
    const response = await apiClient.get('/api/v1/cases', { params });
    return response.data;
  },

  async getCase(caseId) {
    const response = await apiClient.get(`/api/v1/cases/${caseId}`);
    return response.data;
  },

  async createCase(payload) {
    const response = await apiClient.post('/api/v1/cases', payload);
    return response.data;
  },

  async updateCase(caseId, payload) {
    const response = await apiClient.patch(`/api/v1/cases/${caseId}`, payload);
    return response.data;
  },

  async listCaseEntries(caseId) {
    const response = await apiClient.get(`/api/v1/cases/${caseId}/entries`);
    return response.data;
  },

  async createEntry(caseId, payload) {
    const response = await apiClient.post(`/api/v1/cases/${caseId}/entries`, payload);
    return response.data;
  },

  async updateEntry(entryId, payload) {
    const response = await apiClient.patch(`/api/v1/entries/${entryId}`, payload);
    return response.data;
  },

  async deleteEntry(entryId) {
    await apiClient.delete(`/api/v1/entries/${entryId}`);
  },

  async getCalendarDate(entryDate) {
    const response = await apiClient.get('/api/v1/calendar/date', {
      params: { date: entryDate },
    });
    return response.data;
  },

  async getCalendarRange(startDate, endDate) {
    const response = await apiClient.get('/api/v1/calendar/range', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};
