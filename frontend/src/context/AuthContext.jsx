import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await apiClient.get('/users/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Token expired or invalid", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        // OAuth2PasswordRequestForm expects form-data
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const res = await apiClient.post('/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        localStorage.setItem('token', res.data.access_token);

        // Fetch profile
        const profileRes = await apiClient.get('/users/me');
        setUser(profileRes.data);
        return profileRes.data;
    };

    const register = async (userData) => {
        await apiClient.post('/auth/register', userData);
        return await login(userData.email, userData.password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
