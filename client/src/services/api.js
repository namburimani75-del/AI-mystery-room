import axios from 'axios';

// Resilient API Base URL: handles with or without trailing '/api', trailing slashes, and whitespace
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s for AI generation
});

// Inject player ID header
api.interceptors.request.use((config) => {
  const playerId = getPlayerId();
  if (playerId) {
    config.headers['x-player-id'] = playerId;
  }
  return config;
});

// Response interceptor for uniform error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const err = new Error(message);
    err.status = error.response?.status;
    err.details = error.response?.data?.details;
    return Promise.reject(err);
  }
);

// Player ID management (non-secret session identifier)
const PLAYER_ID_KEY = 'mystery_room_player_id';

export const getPlayerId = () => {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
};

// API methods
export const healthAPI = {
  check: () => api.get('/health'),
};

export const casesAPI = {
  create: (premise, difficulty) =>
    api.post('/cases', { premise, difficulty, playerId: getPlayerId() }),

  getAll: () =>
    api.get('/cases', { params: { playerId: getPlayerId() } }),

  getById: (id) =>
    api.get(`/cases/${id}`, { params: { playerId: getPlayerId() } }),

  discoverClue: (caseId, clueId) =>
    api.post(`/cases/${caseId}/clues/${clueId}/discover`, { playerId: getPlayerId() }),

  requestHint: (caseId) =>
    api.post(`/cases/${caseId}/hints`, { playerId: getPlayerId() }),

  accuse: (caseId, suspectId) =>
    api.post(`/cases/${caseId}/accuse`, { suspectId, playerId: getPlayerId() }),

  getResult: (caseId) =>
    api.get(`/cases/${caseId}/result`, { params: { playerId: getPlayerId() } }),

  delete: (caseId) =>
    api.delete(`/cases/${caseId}`, { params: { playerId: getPlayerId() } }),
};

export default api;
