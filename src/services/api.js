import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include JWT token in headers
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('peerlearn_user');
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    // You could trigger a logout if 401 Unauthorized is received
    if (error.response?.status === 401) {
      localStorage.removeItem('peerlearn_user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
