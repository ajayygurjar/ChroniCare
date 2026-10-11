import axios from 'axios';

// All data goes through the ChroniCare API (services/core-api). In development Vite forwards /api to it
// (see vite.config.js); in production the gateway does, so the browser only ever talks to one origin.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

// The store registers these once it exists (see store/store.jsx). Going through callbacks avoids an
// import cycle between this file and the Redux slices that use it.
let getToken = () => null;
let onSessionRefreshed = () => {};
let onSessionExpired = () => {};

export const bindAuth = (handlers) => {
  getToken = handlers.getToken;
  onSessionRefreshed = handlers.onSessionRefreshed;
  onSessionExpired = handlers.onSessionExpired;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Access tokens live for minutes. On a 401 the API client trades the refresh cookie for a new one and
// replays the request once; many requests failing together share a single refresh.
let refreshing = null;
const isAuthCall = (url = '') => url.startsWith('/auth/');

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || !original || original._retried || isAuthCall(original.url)) {
      return Promise.reject(error);
    }
    original._retried = true;

    refreshing ??= api
      .post('/auth/refresh')
      .then((response) => {
        onSessionRefreshed(response.data);
        return response.data.accessToken;
      })
      .finally(() => {
        refreshing = null;
      });

    try {
      const token = await refreshing;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      onSessionExpired();
      return Promise.reject(error);
    }
  }
);

// A message fit to show the user, from an API error response or a network failure.
export const apiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response) return error.response.data?.error?.message || fallback;
  if (error?.request) return 'Cannot reach the server. Check your connection and try again.';
  return fallback;
};

export default api;
