import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { STORAGE_KEYS } from '../config/constants';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const userData = await authAPI.getMe(authToken);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    const data = await authAPI.register(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
  };

  const login = async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
