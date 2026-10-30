import axios from 'axios';

/**
 * Client HTTP unique de l'application.
 *  - interceptor de requête  : ajoute "Authorization: Bearer <JWT>" automatiquement ;
 *  - interceptor de réponse : sur 401, tente UNE fois de renouveler l'access token avec le
 *    refresh token (POST /auth/refresh). Si c'est impossible, la session est considérée
 *    comme expirée : JWT supprimé, redirection vers /login?expired=1 (message affiché).
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

const KEYS = {
  token: 'incidentdesk.token',
  refresh: 'incidentdesk.refreshToken',
  user: 'incidentdesk.user',
};

const hasWindow = () => typeof window !== 'undefined';

function read(key) {
  if (!hasWindow()) return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function write(key, value) {
  if (!hasWindow()) return;
  try {
    if (value === null || value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* stockage indisponible : la session reste en mémoire */ }
}

export const tokenStorage = {
  getToken: () => read(KEYS.token),
  getRefreshToken: () => read(KEYS.refresh),
  getUser() {
    const raw = read(KEYS.user);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  /** Enregistre la réponse de /auth/login, /auth/register ou /auth/refresh. */
  saveAuth(auth) {
    write(KEYS.token, auth.token);
    if (auth.refreshToken) write(KEYS.refresh, auth.refreshToken);
    write(KEYS.user, JSON.stringify({
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      role: auth.role,
    }));
  },
  saveUser(user) { write(KEYS.user, JSON.stringify(user)); },
  clear() {
    write(KEYS.token, null);
    write(KEYS.refresh, null);
    write(KEYS.user, null);
  },
};

const isAuthEndpoint = (url = '') => url.startsWith('/auth/') || url.includes('/auth/');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/* ------------------------------------------------ requête : ajout du JWT */
api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------ réponse : gestion du 401 */
let refreshing = null;

function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error('no refresh token'));
  if (!refreshing) {
    refreshing = axios
      .post(`${API_URL}/auth/refresh`, { refreshToken })
      .then((res) => {
        tokenStorage.saveAuth(res.data);
        if (hasWindow()) window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: res.data }));
        return res.data.token;
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

export function expireSession() {
  tokenStorage.clear();
  if (!hasWindow()) return;
  window.dispatchEvent(new Event('auth:expired'));
  if (!window.location.pathname.startsWith('/login')) {
    const next = encodeURIComponent(window.location.pathname);
    window.location.assign(`/login?expired=1&next=${next}`);
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (response?.status === 401 && config && !isAuthEndpoint(config.url)) {
      if (!config._retry) {
        config._retry = true;
        try {
          const newToken = await refreshAccessToken();
          config.headers.Authorization = `Bearer ${newToken}`;
          return api(config);
        } catch {
          /* refresh impossible : on tombe dans l'expiration */
        }
      }
      expireSession();
    }
    return Promise.reject(error);
  },
);

/** Message lisible à partir d'une erreur Axios (format ErrorResponse du backend). */
export function errorMessage(error, fallback = 'Une erreur est survenue') {
  if (!error?.response) return 'Serveur injoignable : vérifiez que l’API est démarrée.';
  return error.response.data?.message || fallback;
}

/** Erreurs de validation champ par champ (400). */
export function fieldErrors(error) {
  return error?.response?.data?.errors || {};
}

export default api;
