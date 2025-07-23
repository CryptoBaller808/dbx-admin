import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BannerManager = () => {
  const [bannerData, setBannerData] = useState({
    title: '',
    altText: '',
    image: null,
    placement: 'exchange'
  });
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const placements = [
    { value: 'exchange', label: 'Exchange Page' },
    { value: 'swap', label: 'Swap Page' },
    { value: 'home', label: 'Home Page' },
    { value: 'nft', label: 'NFT Marketplace' }
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://dbx-backend.onrender.com/admindashboard/banner/get');
      setBanners(response.data.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
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
      if (file.type.startsWith('image/')) {
        setBannerData(prev => ({
          ...prev,
          image: file
        }));
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bannerData.title || !bannerData.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('title', bannerData.title);
      formData.append('altText', bannerData.altText || bannerData.title);
      formData.append('placement', bannerData.placement);
      formData.append('image', bannerData.image);

      const response = await axios.post('https://dbx-backend.onrender.com/admindashboard/banner/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Banner uploaded successfully!');
      
      // Reset form
      setBannerData({
        title: '',
        altText: '',
        image: null,
        placement: 'exchange'
      });
      
      // Clear file input
      const fileInput = document.getElementById('banner-image');
      if (fileInput) fileInput.value = '';
      
      // Refresh banner list
      fetchBanners();
      
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="banner-manager-page">
      <div className="page-header">
        <h1 className="page-title">Banner Image Manager</h1>
        <p className="page-description">Upload and manage banner images for exchange and swap pages</p>
      </div>

      <div className="content-grid">
        {/* Upload Form */}
        <div className="upload-section">
          <div className="section-card">
            <h2 className="section-title">Add New Banner</h2>
            
            <form onSubmit={handleSubmit} className="banner-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="banner-title">Banner Title *</label>
                  <input
                    type="text"
                    id="banner-title"
                    name="title"
                    value={bannerData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Summer Trading Promotion"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="banner-placement">Placement *</label>
                  <select
                    id="banner-placement"
                    name="placement"
                    value={bannerData.placement}
                    onChange={handleInputChange}
                    required
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
                <label htmlFor="banner-alt">Alt Text</label>
                <input
                  type="text"
                  id="banner-alt"
                  name="altText"
                  value={bannerData.altText}
                  onChange={handleInputChange}
                  placeholder="Descriptive text for accessibility"
                />
                <small className="form-hint">Optional: Descriptive text for screen readers</small>
              </div>

              <div className="form-group">
                <label htmlFor="banner-image">Banner Image *</label>
                <input
                  type="file"
                  id="banner-image"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <small className="form-hint">Upload a banner image (recommended: 1200x300px or similar aspect ratio)</small>
              </div>

              {bannerData.image && (
                <div className="image-preview">
                  <h4>Preview:</h4>
                  <img 
                    src={URL.createObjectURL(bannerData.image)} 
                    alt="Banner preview" 
                    className="preview-image"
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Banner'}
              </button>
            </form>
          </div>
        </div>

        {/* Banner List */}
        <div className="list-section">
          <div className="section-card">
            <h2 className="section-title">Existing Banners</h2>
            
            {loading ? (
              <div className="loading-state">Loading banners...</div>
            ) : banners.length > 0 ? (
              <div className="banner-list">
                {banners.map((banner, index) => (
                  <div key={index} className="banner-item">
                    <div className="banner-preview">
                      {banner.image ? (
                        <img src={banner.image} alt={banner.title} />
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="banner-info">
                      <h3>{banner.title}</h3>
                      <p className="banner-placement">
                        <span className="placement-badge">{banner.placement}</span>
                      </p>
                      {banner.altText && (
                        <p className="banner-alt">{banner.altText}</p>
                      )}
                      <p className="banner-date">
                        {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No banners uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManager;

