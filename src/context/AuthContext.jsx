import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { login as apiLogin } from '../services/authService';

const AuthContext = createContext(null);

// ─── localStorage helpers ─────────────────────────────────────────────────────
const TOKEN_KEY = 'crm_token';
const USER_KEY  = 'crm_user';

const loadUser = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  /**
   * Real login — calls POST /api/auth/login.
   * On success: stores JWT token + user in localStorage, updates state.
   */
  const login = useCallback(async ({ email, password }) => {
    const response = await apiLogin({ email, password });

    const { token, user: userData } = response.data;

    // Persist token (used by api.js request interceptor) and user info
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    toast.success('You have been logged out.');
  }, []);

  const isAdmin    = user?.role === 'SUPER_ADMIN' || user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
