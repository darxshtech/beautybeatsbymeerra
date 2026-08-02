import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beautybeatsbymeerra-bdk7.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include JWT token
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('bb_token') : null;
  const branch = typeof window !== 'undefined' ? localStorage.getItem('bb_admin_branch') || 'SALON' : 'SALON';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-branch'] = branch;
  return config;
});

// Add response interceptor to handle 401 token failure automatically
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bb_token');
        localStorage.removeItem('bb_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
