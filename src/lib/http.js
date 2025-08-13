// Centralized HTTP client for DBX Admin Panel
// Handles authentication, timeouts, and error handling

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance with base configuration
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach authentication token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dbx_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('dbx_admin_token');
      localStorage.removeItem('access_token'); // Legacy token cleanup
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;

