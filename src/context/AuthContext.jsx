import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is already logged in on app load
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axiosInstance.post("/auth/current-user");
                setUser(response.data.data.currentuser);
            } catch (err) {
                 
                setUser(null);
               
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    const login = (userData, accessToken) => {
        setUser(userData);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (err) {
            // even if request fails, clear local state
        } finally {
            setUser(null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);