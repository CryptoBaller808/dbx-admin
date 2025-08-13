// Standardized API configuration for DBX Admin Panel
// Uses VITE_API_BASE_URL for consistency across all environments

export const API_URL = process.env.REACT_APP_API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://dbx-backend-api-production-98f3.up.railway.app';

// Legacy support - remove after migration
// export const API_URL = process.env.REACT_APP_API_URL;



