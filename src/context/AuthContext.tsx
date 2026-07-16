// ============================================================
// SkillGraph — Authentication Context
// ============================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { base44Client } from '../services/base44Client';
import { getAuthToken, saveAuthToken, deleteAuthToken } from '../utils/secureStore';
import { User } from '../types';

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore session on app startup
  useEffect(() => {
    const restore = async () => {
      const storedToken = await getAuthToken();
      if (storedToken) {
        base44Client.setAuthToken(storedToken);
        setToken(storedToken);
        try {
          // Assuming the token payload contains userId, but for demo we fetch a generic user
          const profile = await base44Client.getUserProfile('me'); // replace with actual
          setUser(profile);
        } catch (e) {
          console.warn('Failed to restore user profile.', e);
          await deleteAuthToken();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await base44Client.loginUser(email, password);
    await saveAuthToken(response.token);
    base44Client.setAuthToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (email: string, password: string) => {
    const response = await base44Client.registerUser(email, password);
    await saveAuthToken(response.token);
    base44Client.setAuthToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    await deleteAuthToken();
    base44Client.setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
