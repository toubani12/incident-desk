import api from './api';

const incidentService = {
  create: (payload) => api.post('/api/incidents', payload).then((r) => r.data),
  mine: () => api.get('/api/incidents/my').then((r) => r.data),
  assigned: () => api.get('/api/incidents/assigned').then((r) => r.data),
  all: (params = {}) => api.get('/api/incidents', { params }).then((r) => r.data),
  get: (id) => api.get(`/api/incidents/${id}`).then((r) => r.data),
  updateStatus: (id, status, note) =>
    api.put(`/api/incidents/${id}/status`, { status, note: note || null }).then((r) => r.data),
  assign: (id, technicianId) => api.put(`/api/incidents/${id}/assign/${technicianId}`).then((r) => r.data),
  addComment: (id, content) => api.post(`/api/incidents/${id}/comments`, { content }).then((r) => r.data),
  dashboard: () => api.get('/api/dashboard').then((r) => r.data),
};

export default incidentService;
