// Standardized API configuration for DBX Admin Panel
// Supports multiple environment variable formats for maximum compatibility

const raw = 
  import.meta?.env?.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  'https://dbx-backend-api-production-98f3.up.railway.app';

// Strip trailing slashes for consistency
export const API_BASE_URL = raw.replace(/\/+$/, '');

// Legacy export for backward compatibility
export const API_URL = API_BASE_URL;

