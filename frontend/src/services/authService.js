import axios from 'axios';
import api, { API_URL, tokenStorage } from './api';

/** Authentification + profil de l'utilisateur connecté. */
const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStorage.saveAuth(data);
    return data;
  },

  /** Le rôle n'est jamais envoyé : le backend impose EMPLOYEE. */
  async register(fullName, email, password) {
    const { data } = await api.post('/auth/register', { fullName, email, password });
    tokenStorage.saveAuth(data);
    return data;
  },

  /** Révoque le refresh token côté serveur puis vide le stockage local. */
  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clear();
    if (refreshToken) {
      try { await axios.post(`${API_URL}/auth/logout`, { refreshToken }); } catch { /* déjà invalide */ }
    }
  },

  async getProfile() {
    const { data } = await api.get('/api/profile');
    return data;
  },

  /** Si l'email change, le backend renvoie de nouveaux tokens (claim "sub" = email). */
  async updateProfile(fullName, email) {
    const { data } = await api.put('/api/profile', { fullName, email });
    if (data.auth) tokenStorage.saveAuth(data.auth);
    return data;
  },

  async changePassword(currentPassword, newPassword, confirmPassword) {
    const { data } = await api.put('/api/profile/password', { currentPassword, newPassword, confirmPassword });
    return data;
  },
};

export default authService;
