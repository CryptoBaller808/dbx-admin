import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../css/AdminLogin.scss';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('dbx_admin_token');
    if (token) {
      // Verify token with backend
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('https://dbx-backend.onrender.com/admindashboard/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('✅ [AdminLogin] Token verified, auto-login successful');
        onLogin(token, response.data.admin);
      } else {
        // Invalid token, remove it
        localStorage.removeItem('dbx_admin_token');
      }
    } catch (error) {
      console.error('❌ [AdminLogin] Token verification failed:', error);
      localStorage.removeItem('dbx_admin_token');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('https://dbx-backend.onrender.com/admindashboard/auth/login', {
        username: credentials.username,
        password: credentials.password
      });

      if (response.data.success) {
        const { token, admin } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('dbx_admin_token', token);
        
        console.log('✅ [AdminLogin] Login successful');
        toast.success(`Welcome back, ${admin.username}!`);
        
        // Call parent login handler
        onLogin(token, admin);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
      
    } catch (error) {
      console.error('❌ [AdminLogin] Login error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Invalid username or password');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-section">
              <h1 className="platform-title">DBX Admin</h1>
              <p className="platform-subtitle">Digital Block Exchange</p>
            </div>
            <h2 className="login-title">Admin Login</h2>
            <p className="login-description">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter your username"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="security-notice">
              <p>🔒 Secure admin access</p>
              <p>For authorized personnel only</p>
            </div>
            
            <div className="demo-credentials">
              <h4>Demo Credentials:</h4>
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> DBX2024!Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

