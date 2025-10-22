import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import bannerApi from '../services/bannerApi';
import '../css/TokenBannerManager.scss';

const BannerManager = () => {
  const [bannerData, setBannerData] = useState({
    title: '',
    altText: '',
    image: null,
    placement: 'home'
  });
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);

  const placements = [
    { value: 'home', label: 'Home Page' },
    { value: 'exchange', label: 'Exchange Page' },
    { value: 'global-header', label: 'Global Header' }
  ];

  useEffect(() => {
    // Check API configuration
    const status = bannerApi.getConfigStatus();
    setConfigStatus(status);
    
    if (bannerApi.isConfigured()) {
      fetchBanners();
    } else {
      console.warn('Banner API not configured:', status);
    }
  }, []);

  const fetchBanners = async (placement = null) => {
    try {
      setLoading(true);
      const response = await bannerApi.getBanners(placement);
      setBanners(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error(`Failed to fetch banners: ${error.message}`);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBannerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Validate file
        bannerApi.validateFile(file);
        
        setBannerData(prev => ({
          ...prev,
          image: file
        }));

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        
        toast.success('Image selected successfully');
      } catch (error) {
        toast.error(error.message);
        e.target.value = ''; // Clear the input
      }
    }
  };

  const handlePlacementFilter = (e) => {
    const placement = e.target.value;
    setSelectedPlacement(placement);
    fetchBanners(placement || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bannerApi.isConfigured()) {
      toast.error('Banner API not configured. Please check environment variables.');
      return;
    }

    if (!bannerData.title.trim()) {
      toast.error('Please enter a banner title');
      return;
    }

    if (!bannerData.image) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      
      const uploadData = {
        title: bannerData.title.trim(),
        placement: bannerData.placement,
        altText: bannerData.altText.trim(),
        image: bannerData.image
      };

      const result = await bannerApi.uploadBanner(uploadData);
      
      toast.success('Banner uploaded successfully!');
      
      // Reset form
      setBannerData({
        title: '',
        altText: '',
        image: null,
        placement: 'home'
      });
      setImagePreview(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Refresh banner list
      fetchBanners(selectedPlacement || null);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bannerId, bannerTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bannerTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await bannerApi.deleteBanner(bannerId);
      toast.success('Banner deleted successfully');
      
      // Refresh banner list
      fetchBanners(selectedPlacement || null);
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlacementLabel = (value) => {
    const placement = placements.find(p => p.value === value);
    return placement ? placement.label : value;
  };

  // Show configuration error if API is not set up
  if (configStatus && !bannerApi.isConfigured()) {
    return (
      <div className="banner-manager">
        <div className="header">
          <h1>Banner Manager</h1>
        </div>
        
        <div className="config-error">
          <h3>⚠️ Configuration Required</h3>
          <p>Banner API is not properly configured. Please check the following environment variables:</p>
          <ul>
            <li>REACT_APP_BACKEND_API: {configStatus.hasBackendUrl ? '✅' : '❌'} {configStatus.backendUrl || 'Not set'}</li>
            <li>REACT_APP_ADMIN_API_KEY: {configStatus.hasAdminKey ? '✅' : '❌'} {configStatus.hasAdminKey ? 'Set' : 'Not set'}</li>
          </ul>
          <p>Please update your environment variables and restart the application.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="banner-manager">
      <div className="header">
        <h1>Banner Manager</h1>
        <p>Upload and manage banners for different sections of the platform</p>
      </div>

      {/* Upload Form */}
      <div className="upload-section">
        <h2>Upload New Banner</h2>
        <form onSubmit={handleSubmit} className="banner-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Banner Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={bannerData.title}
                onChange={handleInputChange}
                placeholder="Enter banner title"
                required
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="placement">Placement *</label>
              <select
                id="placement"
                name="placement"
                value={bannerData.placement}
                onChange={handleInputChange}
                required
                disabled={uploading}
              >
                {placements.map(placement => (
                  <option key={placement.value} value={placement.value}>
                    {placement.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="altText">Alt Text (Optional)</label>
            <input
              type="text"
              id="altText"
              name="altText"
              value={bannerData.altText}
              onChange={handleInputChange}
              placeholder="Accessibility description for the image"
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Banner Image *</label>
            <input
              type="file"
              id="image"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              required
              disabled={uploading}
            />
            <small>Supported formats: PNG, JPEG, WebP, GIF. Maximum size: 5MB</small>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <h4>Preview:</h4>
              <img src={imagePreview} alt="Banner preview" />
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={uploading || !bannerData.title.trim() || !bannerData.image}
          >
            {uploading ? 'Uploading...' : 'Upload Banner'}
          </button>
        </form>
      </div>

      {/* Banner List */}
      <div className="banners-section">
        <div className="section-header">
          <h2>Existing Banners</h2>
          <div className="filter-group">
            <label htmlFor="placementFilter">Filter by placement:</label>
            <select
              id="placementFilter"
              value={selectedPlacement}
              onChange={handlePlacementFilter}
              disabled={loading}
            >
              <option value="">All Placements</option>
              {placements.map(placement => (
                <option key={placement.value} value={placement.value}>
                  {placement.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="no-banners">
            <p>No banners found{selectedPlacement ? ` for ${getPlacementLabel(selectedPlacement)}` : ''}.</p>
            <p>Upload your first banner using the form above.</p>
          </div>
        ) : (
          <div className="banners-grid">
            {banners.map(banner => (
              <div key={banner.id} className="banner-card">
              <div className="banner-image">
                <img src={banner.thumbnailUrl || banner.url} alt={banner.altText || banner.title} />
                </div>
                <div className="banner-info">
                  <h3>{banner.title}</h3>
                  <div className="banner-meta">
                    <span className="placement">{getPlacementLabel(banner.placement)}</span>
                    <span className="date">{formatDate(banner.createdAt)}</span>
                  </div>
                  <div className="banner-details">
                    <p><strong>Dimensions:</strong> {banner.width} × {banner.height}px</p>
                    <p><strong>Format:</strong> {banner.format?.toUpperCase()}</p>
                    {banner.altText && <p><strong>Alt Text:</strong> {banner.altText}</p>}
                  </div>
                  <div className="banner-actions">
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(banner.id, banner.title)}
                      title="Delete banner"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManager;
