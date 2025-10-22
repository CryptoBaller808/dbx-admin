// Banner API service for admin frontend
const BACKEND_API = process.env.REACT_APP_BACKEND_API;
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY;

class BannerApiService {
  constructor() {
    this.baseUrl = BACKEND_API;
    this.adminKey = ADMIN_API_KEY;
  }

  // Get headers with admin authentication
  getHeaders(includeContentType = true) {
    const headers = {
      'X-Admin-Key': this.adminKey,
    };
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Admin authentication required. Please check your admin key.');
      } else if (response.status === 403) {
        throw new Error('Invalid admin key. Access denied.');
      } else if (response.status === 502) {
        throw new Error('Service temporarily unavailable. Please try again later.');
      } else {
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
    return response.json();
  }

  // Upload banner
  async uploadBanner(bannerData) {
    const formData = new FormData();
    formData.append('title', bannerData.title);
    formData.append('placement', bannerData.placement);
    if (bannerData.altText) {
      formData.append('altText', bannerData.altText);
    }
    formData.append('image', bannerData.image);

    const response = await fetch(`${this.baseUrl}/admin/banner/upload`, {
      method: 'POST',
      headers: {
        'x-admin-key': this.adminKey,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Get banners with optional placement filter (public endpoint - no auth needed)
  async getBanners(placement = null) {
    const url = placement 
      ? `${this.baseUrl}/admin/banners?placement=${encodeURIComponent(placement)}`
      : `${this.baseUrl}/admin/banners`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return this.handleResponse(response);
  }

  // Delete banner
  async deleteBanner(bannerId) {
    const response = await fetch(`${this.baseUrl}/admin/banner/${bannerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': this.adminKey,
      },
    });

    return this.handleResponse(response);
  }

  // Validate file before upload
  validateFile(file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload PNG, JPEG, WebP, or GIF images only.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    return true;
  }

  // Check if API is configured
  isConfigured() {
    return !!(this.baseUrl && this.adminKey);
  }

  // Get configuration status
  getConfigStatus() {
    return {
      hasBackendUrl: !!this.baseUrl,
      hasAdminKey: !!this.adminKey,
      backendUrl: this.baseUrl,
    };
  }
}

// Export singleton instance
export const bannerApi = new BannerApiService();
export default bannerApi;
