import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { API_BASE } from '../config/api';

interface AdminContextType {
  adminToken: string | null;
  isAdmin: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('adminToken');
    if (stored) {
      setAdminToken(stored);
    }
  }, []);

  const login = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      const data = await response.json();
      setAdminToken(data.token);
      localStorage.setItem('adminToken', data.token);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
  };

  return (
    <AdminContext.Provider value={{ adminToken, isAdmin: !!adminToken, login, logout, loading, error }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
