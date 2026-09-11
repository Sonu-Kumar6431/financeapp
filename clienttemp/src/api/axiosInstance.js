import axios from 'axios';

// In development: Vite proxy forwards /api → http://localhost:5000/api (see vite.config.js).
// In production (Vercel): set VITE_API_URL=https://your-render-app.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally – but ONLY redirect when it's not an auth endpoint.
// Without this guard, a wrong password on /login or a validation error on
// /register would force a redirect before the error message could be shown.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith('/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;