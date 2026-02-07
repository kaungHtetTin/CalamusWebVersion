import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'calamus_token';
const USER_KEY = 'calamus_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Try to restore user from localStorage for instant UI
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.me();
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      } catch (err) {
        // Token is invalid or expired - clear everything
        console.error('Token validation failed:', err);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = useCallback(async (phone, password) => {
    const response = await authAPI.login(phone, password);
    const { token, user: userData } = response.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authAPI.register(data);
    const { token, user: userData } = response.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Even if API call fails, clear local state
      console.error('Logout API error:', err);
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
