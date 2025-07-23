import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../css/TokenBannerManager.scss';

const TokenManager = () => {
  const [tokenData, setTokenData] = useState({
    name: '',
    symbol: '',
    network: '',
    contractAddress: '',
    icon: null
  });
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingToken, setEditingToken] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const networks = [
    'Ethereum',
    'Bitcoin', 
    'BNB Smart Chain',
    'Avalanche',
    'Polygon',
    'Solana',
    'XDC Network',
    'XRP Ledger',
    'Stellar'
  ];

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://dbx-backend.onrender.com/admindashboard/token/get');
      if (response.data.success) {
        setTokens(response.data.tokens || []);
        console.log(`✅ [TokenManager] Loaded ${response.data.tokens?.length || 0} tokens`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch tokens');
      }
    } catch (error) {
      console.error('❌ [TokenManager] Error fetching tokens:', error);
      toast.error('Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTokenData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setTokenData(prev => ({
          ...prev,
          icon: file
        }));
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenData.name || !tokenData.symbol || !tokenData.network) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('name', tokenData.name);
      formData.append('symbol', tokenData.symbol);
      formData.append('network', tokenData.network);
      formData.append('contractAddress', tokenData.contractAddress);
      if (tokenData.icon) {
        formData.append('icon', tokenData.icon);
      }

      const response = await axios.post('https://dbx-backend.onrender.com/admindashboard/token/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Token uploaded successfully!');
      
      // Reset form
      setTokenData({
        name: '',
        symbol: '',
        network: '',
        contractAddress: '',
        icon: null
      });
      
      // Clear file input
      const fileInput = document.getElementById('token-icon');
      if (fileInput) fileInput.value = '';
      
      // Refresh token list
      fetchTokens();
      
    } catch (error) {
      console.error('Error uploading token:', error);
      toast.error('Failed to upload token');
    } finally {
      setUploading(false);
    }
  };

  // Edit token function
  const handleEditToken = (token) => {
    setEditingToken(token);
    setTokenData({
      name: token.name,
      symbol: token.symbol,
      network: token.network,
      contractAddress: token.contractAddress || '',
      icon: null // Don't pre-fill file input
    });
    setShowEditModal(true);
  };

  // Update token function
  const handleUpdateToken = async (e) => {
    e.preventDefault();
    
    if (!tokenData.name || !tokenData.symbol || !tokenData.network) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('id', editingToken.id);
      formData.append('name', tokenData.name);
      formData.append('symbol', tokenData.symbol);
      formData.append('network', tokenData.network);
      formData.append('contractAddress', tokenData.contractAddress);
      if (tokenData.icon) {
        formData.append('icon', tokenData.icon);
      }

      const response = await axios.put(`https://dbx-backend.onrender.com/admindashboard/token/update/${editingToken.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Token updated successfully!');
        setShowEditModal(false);
        setEditingToken(null);
        
        // Reset form
        setTokenData({
          name: '',
          symbol: '',
          network: '',
          contractAddress: '',
          icon: null
        });
        
        // Refresh token list
        fetchTokens();
      } else {
        throw new Error(response.data.message || 'Failed to update token');
      }
      
    } catch (error) {
      console.error('❌ [TokenManager] Error updating token:', error);
      toast.error('Failed to update token');
    } finally {
      setUploading(false);
    }
  };

  // Delete token function
  const handleDeleteToken = async (tokenId) => {
    try {
      const response = await axios.delete(`https://dbx-backend.onrender.com/admindashboard/token/delete/${tokenId}`);
      
      if (response.data.success) {
        toast.success('Token deleted successfully!');
        fetchTokens(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to delete token');
      }
    } catch (error) {
      console.error('❌ [TokenManager] Error deleting token:', error);
      toast.error('Failed to delete token');
    }
    setDeleteConfirm(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingToken(null);
    setTokenData({
      name: '',
      symbol: '',
      network: '',
      contractAddress: '',
      icon: null
    });
  };

  return (
    <div className="token-manager-page">
      <div className="page-header">
        <h1 className="page-title">Token Listings Manager</h1>
        <p className="page-description">Upload and manage token listings for the exchange</p>
      </div>

      <div className="content-grid">
        {/* Upload Form */}
        <div className="upload-section">
          <div className="section-card">
            <h2 className="section-title">{editingToken ? 'Edit Token' : 'Add New Token'}</h2>
            
            <form onSubmit={editingToken ? handleUpdateToken : handleSubmit} className="token-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="token-name">Token Name *</label>
                  <input
                    type="text"
                    id="token-name"
                    name="name"
                    value={tokenData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Bitcoin"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="token-symbol">Symbol *</label>
                  <input
                    type="text"
                    id="token-symbol"
                    name="symbol"
                    value={tokenData.symbol}
                    onChange={handleInputChange}
                    placeholder="e.g., BTC"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="token-network">Network *</label>
                  <select
                    id="token-network"
                    name="network"
                    value={tokenData.network}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Network</option>
                    {networks.map(network => (
                      <option key={network} value={network}>{network}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="contract-address">Contract Address</label>
                  <input
                    type="text"
                    id="contract-address"
                    name="contractAddress"
                    value={tokenData.contractAddress}
                    onChange={handleInputChange}
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="token-icon">Token Icon (PNG)</label>
                <input
                  type="file"
                  id="token-icon"
                  accept="image/png,image/jpg,image/jpeg"
                  onChange={handleFileChange}
                />
                <small className="form-hint">Upload a PNG/JPG icon for the token (recommended: 64x64px)</small>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Token'}
              </button>
            </form>
          </div>
        </div>

        {/* Token List */}
        <div className="list-section">
          <div className="section-card">
            <h2 className="section-title">Existing Tokens</h2>
            
            {loading ? (
              <div className="loading-state">Loading tokens...</div>
            ) : tokens.length > 0 ? (
              <div className="token-list">
                {tokens.map((token, index) => (
                  <div key={index} className="token-item">
                    <div className="token-icon">
                      {token.icon ? (
                        <img src={token.icon} alt={token.name} />
                      ) : (
                        <div className="icon-placeholder">{token.symbol?.charAt(0)}</div>
                      )}
                    </div>
                    <div className="token-info">
                      <h3>{token.name}</h3>
                      <p className="token-symbol">{token.symbol}</p>
                      <p className="token-network">{token.network}</p>
                      {token.contractAddress && (
                        <p className="contract-address">{token.contractAddress}</p>
                      )}
                    </div>
                    <div className="token-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditToken(token)}
                        title="Edit Token"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => setDeleteConfirm(token.id)}
                        title="Delete Token"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No tokens uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this token? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={() => handleDeleteToken(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Buttons */}
      {editingToken && (
        <div className="form-actions-edit">
          <button 
            type="button"
            className="btn-cancel"
            onClick={handleCancelEdit}
          >
            Cancel Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenManager;

