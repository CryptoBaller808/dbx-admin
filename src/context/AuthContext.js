import { createContext, useContext, useEffect, useState } from "react";
import { http } from '../lib/http';

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
}

const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState();
    const [isLoading, setIsLoading] = useState(false);

    // Real authentication flow using proper backend routes
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            
            // Use proper admin authentication endpoint with both email and username for compatibility
            const response = await http.post('/admindashboard/auth/login', {
                email,
                username: email, // compatibility - backend accepts either
                password
            });
            
            if (response.data.success && response.data.token) {
                // Store token in localStorage
                localStorage.setItem('dbx_admin_token', response.data.token);
                
                // Immediately verify token by getting profile
                const profileResponse = await http.get('/admindashboard/auth/profile');
                
                if (profileResponse.data.success) {
                    setCurrentUser(profileResponse.data.admin); // Backend returns 'admin' object
                    return {
                        data: {
                            access_token: response.data.token,
                            user: profileResponse.data.admin,
                            message: response.data.message || 'Login successful'
                        }
                    };
                }
            }
            
            throw new Error(response.data.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    }

    // logout 
    const logout = async () => {
        try {
            // Call backend logout endpoint if token exists
            const token = localStorage.getItem('dbx_admin_token');
            if (token) {
                await http.post('/admindashboard/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local storage and state
            localStorage.removeItem('dbx_admin_token');
            localStorage.removeItem('access_token'); // Legacy cleanup
            setCurrentUser(null);
        }
    }

    // verify jwt using backend profile endpoint
    const verifyJwt = async (token) => {
        try {
            if (!token) {
                logout();
                return false;
            }
            
            // Verify token with backend
            const response = await http.get('/admindashboard/auth/profile');
            
            if (response.data.success && response.data.admin) {
                setCurrentUser(response.data.admin); // Backend returns 'admin' object
                return true;
            }
            
            logout();
            return false;
        } catch (error) {
            console.error('JWT verification error:', error);
            logout();
            return false;
        }
    }

    // Check token validity on app load
    const checkTokenValidity = async () => {
        const token = localStorage.getItem('dbx_admin_token') || localStorage.getItem('access_token');
        if (token) {
            // Migrate legacy token
            if (!localStorage.getItem('dbx_admin_token') && localStorage.getItem('access_token')) {
                localStorage.setItem('dbx_admin_token', token);
                localStorage.removeItem('access_token');
            }
            
            await verifyJwt(token);
        }
    }

    useEffect(() => {
        checkTokenValidity();
    }, [])

    let values = {
        currentUser,
        setCurrentUser,
        isLoading,
        setIsLoading,
        login,
        logout,
        verifyJwt,
        checkTokenValidity
    }

    return (
        <AuthContext.Provider value={values}>
            { children }
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;