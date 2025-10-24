import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as tokenApi from '../services/tokenApi';
import '../css/TokenBannerManager.scss';

const TokenManagerNew = () => {
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingToken, setEditingToken] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    decimals: 18,
    chain: '',
    contract: '',
    defaultQuote: 'USDT',
    active: true,
    sort: 999,
    priceProvider: 'binance',
    tvSymbol: '',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [chainFilter, setChainFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  // Constants
  const chains = ['BTC', 'ETH', 'BSC', 'XRP', 'XLM', 'MATIC', 'SOL', 'AVAX', 'XDC'];
  const priceProviders = ['binance', 'coingecko', 'coincap', 'kucoin', 'dbx'];
  
  useEffect(() => {
    fetchTokens();
    
    // Log backend URL for ops visibility
    if (process.env.NODE_ENV !== 'production') {
      console.log('[TokenManager] Backend:', process.env.REACT_APP_BACKEND_API);
    }
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [tokens, searchTerm, chainFilter, activeFilter]);
  
  const fetchTokens = async () => {
    try {
      setLoading(true);
      const data = await tokenApi.getTokens();
      setTokens(data);
      console.log(`[TokenManager] Loaded ${data.length} tokens`);
    } catch (error) {
      console.error('[TokenManager] Error fetching tokens:', error);
      toast.error('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...tokens];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        token =>
          token.symbol.toLowerCase().includes(term) ||
          token.name.toLowerCase().includes(term)
      );
    }
    
    // Chain filter
    if (chainFilter) {
      filtered = filtered.filter(token => token.chain === chainFilter);
    }
    
    // Active filter
    if (activeFilter === 'active') {
      filtered = filtered.filter(token => token.active);
    } else if (activeFilter === 'inactive') {
      filtered = filtered.filter(token => !token.active);
    }
    
    // Sort by sort field, then by symbol
    filtered.sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort;
      return a.symbol.localeCompare(b.symbol);
    });
    
    setFilteredTokens(filtered);
  };
  
  const openCreateModal = () => {
    setEditingToken(null);
    setFormData({
      symbol: '',
      name: '',
      decimals: 18,
      chain: '',
      contract: '',
      defaultQuote: 'USDT',
      active: true,
      sort: 999,
      priceProvider: 'binance',
      tvSymbol: '',
    });
    setLogoFile(null);
    setLogoPreview(null);
    setShowModal(true);
  };
  
  const openEditModal = (token) => {
    setEditingToken(token);
    setFormData({
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      chain: token.chain,
      contract: token.contract || '',
      defaultQuote: token.defaultQuote,
      active: token.active,
      sort: token.sort,
      priceProvider: token.priceProvider,
      tvSymbol: token.tvSymbol,
    });
    setLogoFile(null);
    setLogoPreview(token.logoUrl);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setEditingToken(null);
    setLogoFile(null);
    setLogoPreview(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PNG, JPEG, WebP, and SVG are allowed.');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const validateForm = () => {
    if (!formData.symbol || !formData.name || !formData.chain || !formData.priceProvider) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    // Validate symbol format (uppercase, alphanumeric)
    if (!/^[A-Z0-9]+$/.test(formData.symbol)) {
      toast.error('Symbol must be uppercase alphanumeric');
      return false;
    }
    
    // Validate decimals
    const decimals = parseInt(formData.decimals);
    if (isNaN(decimals) || decimals < 0 || decimals > 18) {
      toast.error('Decimals must be between 0 and 18');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setUploading(true);
      
      // Prepare token data
      const tokenData = {
        ...formData,
        symbol: formData.symbol.toUpperCase(),
        decimals: parseInt(formData.decimals),
        sort: parseInt(formData.sort),
        tvSymbol: formData.tvSymbol || `${formData.symbol.toUpperCase()}/USDT`,
      };
      
      let savedToken;
      
      if (editingToken) {
        // Update existing token
        savedToken = await tokenApi.updateToken(editingToken.id, tokenData);
        toast.success('Token updated successfully');
      } else {
        // Create new token
        savedToken = await tokenApi.createToken(tokenData);
        toast.success('Token created successfully');
      }
      
      // Upload logo if provided
      if (logoFile && savedToken.id) {
        try {
          const result = await tokenApi.uploadLogo(savedToken.id, logoFile);
          savedToken = result.token;
          toast.success('Logo uploaded successfully');
        } catch (error) {
          console.error('[TokenManager] Error uploading logo:', error);
          toast.error('Token saved but logo upload failed');
        }
      }
      
      // Refresh token list
      await fetchTokens();
      closeModal();
    } catch (error) {
      console.error('[TokenManager] Error saving token:', error);
      toast.error(error.message || 'Failed to save token');
    } finally {
      setUploading(false);
    }
  };
  
  const handleToggleActive = async (token) => {
    try {
      await tokenApi.updateToken(token.id, { active: !token.active });
      toast.success(`Token ${token.active ? 'deactivated' : 'activated'}`);
      await fetchTokens();
    } catch (error) {
      console.error('[TokenManager] Error toggling active:', error);
      toast.error('Failed to update token');
    }
  };
  
  const handleDelete = async (token, hard = false) => {
    try {
      await tokenApi.deleteToken(token.id, hard);
      toast.success(hard ? 'Token deleted permanently' : 'Token deactivated');
      setDeleteConfirm(null);
      await fetchTokens();
    } catch (error) {
      console.error('[TokenManager] Error deleting token:', error);
      toast.error('Failed to delete token');
    }
  };
  
  if (loading) {
    return (
      <div className="token-banner-manager">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading tokens...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="token-banner-manager">
      <div className="manager-header">
        <h1>Token Manager</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          + Create Token
        </button>
      </div>
      
      {/* Filters */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by symbol or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={chainFilter}
          onChange={(e) => setChainFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Chains</option>
          {chains.map(chain => (
            <option key={chain} value={chain}>{chain}</option>
          ))}
        </select>
        
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        
        <div className="filter-stats">
          Showing {filteredTokens.length} of {tokens.length} tokens
        </div>
      </div>
      
      {/* Token Table */}
      <div className="tokens-table-container">
        {filteredTokens.length === 0 ? (
          <div className="empty-state">
            <p>No tokens found</p>
            {searchTerm || chainFilter || activeFilter !== 'all' ? (
              <button onClick={() => { setSearchTerm(''); setChainFilter(''); setActiveFilter('all'); }}>
                Clear Filters
              </button>
            ) : (
              <button onClick={openCreateModal}>Create First Token</button>
            )}
          </div>
        ) : (
          <table className="tokens-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Symbol</th>
                <th>Name</th>
                <th>Chain</th>
                <th>Decimals</th>
                <th>Provider</th>
                <th>Sort</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map(token => (
                <tr key={token.id} className={!token.active ? 'inactive-row' : ''}>
                  <td>
                    {token.logoUrl ? (
                      <img
                        src={token.logoUrl}
                        alt={token.symbol}
                        className="token-logo-thumb"
                      />
                    ) : (
                      <div className="token-logo-placeholder">{token.symbol[0]}</div>
                    )}
                  </td>
                  <td><strong>{token.symbol}</strong></td>
                  <td>{token.name}</td>
                  <td><span className="chain-badge">{token.chain}</span></td>
                  <td>{token.decimals}</td>
                  <td><span className="provider-badge">{token.priceProvider}</span></td>
                  <td>{token.sort}</td>
                  <td>
                    <span className={`status-badge ${token.active ? 'active' : 'inactive'}`}>
                      {token.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => openEditModal(token)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-toggle"
                      onClick={() => handleToggleActive(token)}
                      title={token.active ? 'Deactivate' : 'Activate'}
                    >
                      {token.active ? '🔴' : '🟢'}
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => setDeleteConfirm(token)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingToken ? 'Edit Token' : 'Create New Token'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="token-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Symbol *</label>
                  <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder="BTC"
                    required
                    disabled={!!editingToken}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <small>Uppercase, alphanumeric</small>
                </div>
                
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Bitcoin"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Chain *</label>
                  <select
                    name="chain"
                    value={formData.chain}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Chain</option>
                    {chains.map(chain => (
                      <option key={chain} value={chain}>{chain}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Decimals *</label>
                  <input
                    type="number"
                    name="decimals"
                    value={formData.decimals}
                    onChange={handleInputChange}
                    min="0"
                    max="18"
                    required
                  />
                  <small>0-18</small>
                </div>
              </div>
              
              <div className="form-group">
                <label>Contract Address</label>
                <input
                  type="text"
                  name="contract"
                  value={formData.contract}
                  onChange={handleInputChange}
                  placeholder="0x... (optional)"
                />
                <small>For EVM tokens only</small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price Provider *</label>
                  <select
                    name="priceProvider"
                    value={formData.priceProvider}
                    onChange={handleInputChange}
                    required
                  >
                    {priceProviders.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Default Quote</label>
                  <input
                    type="text"
                    name="defaultQuote"
                    value={formData.defaultQuote}
                    onChange={handleInputChange}
                    placeholder="USDT"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>TradingView Symbol</label>
                  <input
                    type="text"
                    name="tvSymbol"
                    value={formData.tvSymbol}
                    onChange={handleInputChange}
                    placeholder="BTCUSDT"
                  />
                  <small>Leave empty for auto-generation</small>
                </div>
                
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    name="sort"
                    value={formData.sort}
                    onChange={handleInputChange}
                    min="0"
                  />
                  <small>Lower numbers appear first</small>
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <span>Active (visible on frontend)</span>
                </label>
              </div>
              
              <div className="form-group">
                <label>Token Logo</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                />
                <small>PNG, JPEG, WebP, SVG (max 5MB, square recommended)</small>
                
                {logoPreview && (
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Logo preview" />
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : (editingToken ? 'Update Token' : 'Create Token')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Token</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{deleteConfirm.symbol}</strong>?</p>
              <p className="warning-text">
                This will deactivate the token. Choose "Hard Delete" to permanently remove it and its logo from Cloudinary.
              </p>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-warning"
                onClick={() => handleDelete(deleteConfirm, false)}
              >
                Deactivate
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(deleteConfirm, true)}
              >
                Hard Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenManagerNew;

