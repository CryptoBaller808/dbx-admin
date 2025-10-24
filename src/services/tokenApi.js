/**
 * Token API Service
 * Handles all token-related API calls for admin panel
 * Prompt C: Enhanced error handling with detailed validation errors
 */

const BASE = process.env.REACT_APP_BACKEND_API;
const ADMIN_KEY = process.env.REACT_APP_ADMIN_API_KEY;

// Fail fast with clear error
if (!BASE) {
  console.error('[Token API] Missing REACT_APP_BACKEND_API environment variable');
}

if (!ADMIN_KEY) {
  console.error('[Token API] Missing REACT_APP_ADMIN_API_KEY environment variable');
}

/**
 * Custom error class for API errors with detailed field errors
 */
export class TokenApiError extends Error {
  constructor(message, errors = null, code = null) {
    super(message);
    this.name = 'TokenApiError';
    this.errors = errors; // Field-level validation errors
    this.code = code; // Error code from backend
  }
}

/**
 * Handle API response and extract errors
 */
async function handleResponse(res) {
  const data = await res.json();
  
  if (!res.ok) {
    // Extract detailed error information
    const message = data.message || data.error || `HTTP ${res.status}`;
    const errors = data.errors || null;
    const code = data.code || null;
    
    throw new TokenApiError(message, errors, code);
  }
  
  return data;
}

/**
 * GET /admin/tokens
 * Public endpoint - List all tokens
 */
export async function getTokens(activeOnly = false) {
  const url = `${BASE}/admin/tokens${activeOnly ? '?active=true' : ''}`;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Token API] Fetching tokens from:', url);
  }
  
  const res = await fetch(url);
  return handleResponse(res);
}

/**
 * GET /admin/pairs
 * Public endpoint - Get trading pairs
 */
export async function getPairs() {
  const url = `${BASE}/admin/pairs`;
  const res = await fetch(url);
  return handleResponse(res);
}

/**
 * GET /admin/health/token
 * Public endpoint - Health check
 */
export async function healthCheck() {
  const url = `${BASE}/admin/health/token`;
  const res = await fetch(url);
  return handleResponse(res);
}

/**
 * POST /admin/token
 * Admin endpoint - Create new token
 */
export async function createToken(tokenData) {
  const url = `${BASE}/admin/token`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
    },
    body: JSON.stringify(tokenData),
  });
  
  return handleResponse(res);
}

/**
 * PUT /admin/token/:id
 * Admin endpoint - Update existing token
 */
export async function updateToken(id, updates) {
  const url = `${BASE}/admin/token/${id}`;
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_KEY,
    },
    body: JSON.stringify(updates),
  });
  
  return handleResponse(res);
}

/**
 * DELETE /admin/token/:id
 * Admin endpoint - Delete token
 */
export async function deleteToken(id, hardDelete = false) {
  const url = `${BASE}/admin/token/${id}${hardDelete ? '?hard=true' : ''}`;
  
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'x-admin-key': ADMIN_KEY,
    },
  });
  
  return handleResponse(res);
}

/**
 * POST /admin/token/:id/logo
 * Admin endpoint - Upload token logo
 */
export async function uploadLogo(id, file) {
  const url = `${BASE}/admin/token/${id}/logo`;
  
  const formData = new FormData();
  formData.append('logo', file);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-admin-key': ADMIN_KEY,
    },
    body: formData,
  });
  
  return handleResponse(res);
}

/**
 * Format validation errors for display
 * @param {Object} errors - Field-level errors from backend
 * @returns {string} - Formatted error message
 */
export function formatValidationErrors(errors) {
  if (!errors || typeof errors !== 'object') {
    return null;
  }
  
  const errorMessages = Object.entries(errors).map(([field, message]) => {
    // Capitalize first letter of field name
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
    return `${fieldName}: ${message}`;
  });
  
  return errorMessages.join('\n');
}

