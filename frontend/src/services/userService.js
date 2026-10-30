import api from './api';

/** Administration des utilisateurs (rôle ADMIN). */
const userService = {
  list: (role) => api.get('/api/admin/users', { params: role ? { role } : {} }).then((r) => r.data),
  technicians: () => api.get('/api/admin/technicians').then((r) => r.data),
  enable: (id) => api.put(`/api/admin/users/${id}/enable`).then((r) => r.data),
  disable: (id) => api.put(`/api/admin/users/${id}/disable`).then((r) => r.data),
  changeRole: (id, role) => api.put(`/api/admin/users/${id}/role`, { role }).then((r) => r.data),
  statistics: () => api.get('/api/admin/statistics').then((r) => r.data),
};

export default userService;
