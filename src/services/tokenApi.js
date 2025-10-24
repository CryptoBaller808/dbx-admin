/**
 * Token API Service
 * Handles all token-related API calls for admin panel
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
 * GET /admin/tokens
 * Public endpoint - List all tokens
 */
export async function getTokens(activeOnly = false) {
  const url = `${BASE}/admin/tokens${activeOnly ? '?active=true' : ''}`;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Token API] Fetching tokens from:', url);
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`tokens_http_${res.status}`);
  return res.json();
}

/**
 * GET /admin/pairs
 * Public endpoint - Get trading pairs
 */
export async function getPairs() {
  const url = `${BASE}/admin/pairs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`pairs_http_${res.status}`);
  return res.json();
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
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || `create_token_http_${res.status}`);
  }
  
  return res.json();
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
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || `update_token_http_${res.status}`);
  }
  
  return res.json();
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
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || `delete_token_http_${res.status}`);
  }
  
  return res.json();
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
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || `upload_logo_http_${res.status}`);
  }
  
  return res.json();
}

