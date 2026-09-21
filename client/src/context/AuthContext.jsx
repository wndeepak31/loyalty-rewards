import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/users/me');
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to load user', err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        // Reload user
        const userRes = await api.get('/users/me');
        setUser(userRes.data);
        return userRes.data;
    };

    const signup = async (name, email, password, phone) => {
        const res = await api.post('/auth/signup', { name, email, password, phone });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            const userRes = await api.get('/users/me');
            setUser(userRes.data);
            return { user: userRes.data, requiresVerification: false };
        }
        return res.data;
    };

    const verifyEmail = async (email, code) => {
        const res = await api.post('/auth/verify-email', { email, code });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            const userRes = await api.get('/users/me');
            setUser(userRes.data);
            return userRes.data;
        }
        return res.data;
    };

    const resendVerificationCode = async (email) => {
        const res = await api.post('/auth/resend-code', { email });
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await api.get('/users/me');
            setUser(res.data);
            return res.data;
        } catch (err) {
            console.error('Failed to refresh user', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, verifyEmail, resendVerificationCode, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
