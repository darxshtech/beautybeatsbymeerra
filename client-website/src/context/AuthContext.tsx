"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, phone: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<boolean>;
  completeProfile: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, phone: string) => {
    const res = await apiClient.post('/auth/login', { email, password: phone });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
  };

  const googleLogin = async (idToken: string) => {
    const res = await apiClient.post('/auth/google', { idToken });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.isProfileComplete;
    }
    return false;
  };

  const completeProfile = async (data: any) => {
    // Using the secure /profile endpoint which identifies the user automatically
    const res = await apiClient.put('/users/profile', { ...data, isProfileComplete: true });
    if (res.data.success) {
      setUser(res.data.data);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, completeProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
