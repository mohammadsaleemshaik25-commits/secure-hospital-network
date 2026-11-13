import axios from 'axios';

/**
 * Resolves the API base URL safely:
 * - If VITE_API_BASE_URL is provided, ensures it points to the '/api' prefix without duplicating it.
 * - If VITE_API_BASE_URL is omitted (local development), defaults to '/api' for Vite's proxy.
 */
function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || !envUrl.trim()) {
    return '/api';
  }
  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 60000, // 60s timeout accommodates hosting platform cold starts
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Preserve existing error handling
    return Promise.reject(error);
  }
);

export default api;
