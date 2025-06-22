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

    // login 
    const login = async (email, password) => {
        const item = {
            email,
            wal_password: password
        }
        return axios.post(`${API_URL}/admindashboard/user/loginAdmin`, { ...item });
    }


    // logout 
    const logout = () => {
        localStorage.removeItem("access_token");
        setCurrentUser();
    }

    // verify jwt
    const verifyJwt = async (data) => {
        if(data?.message === "jwt expired"){
            return logout();
        }else {
            return true;
        }
    }

    useEffect(() => {
        let accessToken = localStorage.getItem("access_token");
        if(accessToken){
            setCurrentUser(accessToken);
        }
    }, [])

    let values = {
        currentUser,
        setCurrentUser,
        isLoading,
        setIsLoading,
        login,
        logout,
        verifyJwt
    }


    return (
        <AuthContext.Provider value={values}>
            { children }
        </AuthContext.Provider>
    )
}


export default AuthContextProvider;