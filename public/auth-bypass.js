/**
 * Client-Side Authentication Bypass for Testing Environment
 * 
 * This script injects a mock JWT token into localStorage to bypass the login process
 * in the admin panel for testing purposes.
 * 
 * IMPORTANT: This is for TESTING ENVIRONMENTS ONLY and should never be used in production.
 * 
 * How to use:
 * 1. Create a file named 'auth-bypass.js' in the public folder of the admin panel
 * 2. Copy this code into that file
 * 3. Add a script tag to index.html: <script src="/auth-bypass.js"></script>
 * 4. Deploy the updated admin panel
 */

(function() {
  // Only run in the testing environment
  if (!window.location.hostname.includes('manusai-x-dbx-admin.vercel.app') && 
      !window.location.hostname.includes('localhost')) {
    console.log('Auth bypass not running - not in testing environment');
    return;
  }

  console.log('Auth bypass script loaded in testing environment');

  // Create a mock JWT token (this is a fake token for testing only)
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZGJ4LmNvbSIsImlhdCI6MTYyMDY0NzYwMCwiZXhwIjoxOTM2MDA3NjAwfQ.mock_signature_for_testing_only';

  // Function to check if we're on the login page
  function isLoginPage() {
    return window.location.pathname.includes('/login');
  }

  // Function to inject the token and redirect if needed
  function injectAuthToken() {
    // Store the token in localStorage
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('isLoggedIn', 'true');
    
    console.log('Auth bypass: Mock token injected into localStorage');
    
    // If on login page, redirect to dashboard
    if (isLoginPage()) {
      console.log('Auth bypass: Redirecting from login to dashboard');
      window.location.href = '/dashboard';
    }
  }

  // Intercept fetch/XHR requests to mock successful login
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // If this is a login request
    if (url.includes('loginAdmin')) {
      console.log('Auth bypass: Intercepting login request');
      
      // Return a mock successful response
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          message: "Login successful",
          access_token: mockToken
        })
      });
    }
    
    // For all other requests, proceed normally
    return originalFetch.apply(this, arguments);
  };

  // Also intercept XMLHttpRequest for older code
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    // Store the URL for later use
    this._bypassUrl = url;
    return originalOpen.call(this, method, url, ...rest);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    // If this is a login request
    if (this._bypassUrl && this._bypassUrl.includes('loginAdmin')) {
      console.log('Auth bypass: Intercepting XHR login request');
      
      // Mock the response
      Object.defineProperty(this, 'readyState', { value: 4, writable: true });
      Object.defineProperty(this, 'status', { value: 200, writable: true });
      Object.defineProperty(this, 'responseText', { 
        value: JSON.stringify({
          message: "Login successful",
          access_token: mockToken
        }),
        writable: true
      });
      
      // Trigger the onload event
      setTimeout(() => {
        this.onload && this.onload();
        this.onreadystatechange && this.onreadystatechange();
      }, 50);
      
      return;
    }
    
    // For all other requests, proceed normally
    return originalSend.call(this, body);
  };

  // Run the injection immediately and also when DOM is fully loaded
  injectAuthToken();
  document.addEventListener('DOMContentLoaded', injectAuthToken);
  
  // Also run when clicking the login button
  document.addEventListener('click', function(e) {
    if (e.target && (
        e.target.textContent === 'Login' || 
        e.target.innerText === 'Login' ||
        e.target.value === 'Login'
      )) {
      console.log('Auth bypass: Login button clicked, injecting token');
      setTimeout(injectAuthToken, 100);
    }
  });

  console.log('Auth bypass: Setup complete');
})();
