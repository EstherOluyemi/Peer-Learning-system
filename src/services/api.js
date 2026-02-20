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
    const message = error.response?.data?.message || 'Something went wrong';
    
    // On 401, clear auth and redirect to login (session expired/invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('peerlearn_user');
      localStorage.removeItem('peerlearn_token');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        // Use a small delay to prevent race conditions with React state updates
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    const wrappedError = new Error(message);
    wrappedError.status = error.response?.status;
    return Promise.reject(wrappedError);
  }
);

export default api;
