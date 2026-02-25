import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token when present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('peerlearn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data || {};
    const errorCode = errorPayload.code || errorPayload.errorCode;
    const message = errorPayload.message || 'Something went wrong';
    
    // Don't trigger global logout for login/auth failures, only for expired sessions
    const authErrorCodes = ['AUTH_FAILED', 'INVALID_CREDENTIALS', 'NOT_A_TUTOR', 'MISSING_FIELDS', 'NO_TOKEN'];
    const shouldLogout = error.response?.status === 401 && !authErrorCodes.includes(errorCode);
    
    if (shouldLogout) {
      localStorage.removeItem('peerlearn_user');
      localStorage.removeItem('peerlearn_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    const wrappedError = new Error(message);
    wrappedError.status = error.response?.status;
    wrappedError.code = errorCode;
    wrappedError.payload = errorPayload;
    return Promise.reject(wrappedError);
  }
);

export default api;
