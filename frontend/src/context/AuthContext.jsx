'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '@/services/authService';
import { tokenStorage } from '@/services/api';

const AuthContext = createContext(null);

/** État d'authentification partagé (utilisateur courant lu depuis le localStorage). */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(tokenStorage.getToken() ? tokenStorage.getUser() : null);
    sync();
    setReady(true);
    const onExpired = () => setUser(null);
    const onRefreshed = (e) => {
      const a = e.detail;
      setUser({ userId: a.userId, fullName: a.fullName, email: a.email, role: a.role });
    };
    window.addEventListener('auth:expired', onExpired);
    window.addEventListener('auth:refreshed', onRefreshed);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('auth:expired', onExpired);
      window.removeEventListener('auth:refreshed', onRefreshed);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const fromAuth = (a) => ({ userId: a.userId, fullName: a.fullName, email: a.email, role: a.role });

  const login = useCallback(async (email, password) => {
    const auth = await authService.login(email, password);
    setUser(fromAuth(auth));
    return auth;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const auth = await authService.register(fullName, email, password);
    setUser(fromAuth(auth));
    return auth;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      tokenStorage.saveUser(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, ready, isAuthenticated: !!user, login, register, logout, updateUser }),
    [user, ready, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}
