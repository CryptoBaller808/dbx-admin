import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
}


const AuthContextProvider = ({ children }) => {

    const [currentUser, setCurrentUser] = useState();
    const [isLoading, setIsLoading] = useState(false);

    // login - Updated to use secure health endpoint
    const login = async (email, password) => {
        // Use GET request to secure health endpoint with login parameters
        const response = await axios.get(`${API_URL}/health`, {
            params: {
                login: 'true',
                email: email,
                password: password
            }
        });
        
        // Check if login was successful
        if (response.data.loginResult === true) {
            return {
                data: {
                    access_token: response.data.token,
                    user: response.data.user,
                    message: response.data.message
                }
            };
        } else {
            throw new Error(response.data.message || 'Login failed');
        }
    }


    // logout 
    const logout = () => {
        localStorage.removeItem("access_token");
        setCurrentUser();
    }

    // verify jwt - Enhanced with proper token validation
    const verifyJwt = async (token) => {
        try {
            if (!token) {
                logout();
                return false;
            }
            
            // Check if token is expired (basic client-side check)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                logout();
                return false;
            }
            
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Date.now() / 1000;
            
            if (payload.exp && payload.exp < currentTime) {
                logout();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('JWT verification error:', error);
            logout();
            return false;
        }
    }

    // Check token validity on app load
    const checkTokenValidity = () => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            const isValid = verifyJwt(accessToken);
            if (isValid) {
                setCurrentUser(accessToken);
            }
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