'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from './types';
import { loginWithEmail, loginWithPin, getMe, logout as apiLogout } from './api';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  loginWithEmail: (login: string, password: string) => Promise<void>;
  loginWithPin: (pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data.user);
        setAccessToken(null);
        setRefreshToken(null);
      })
      .catch(() => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
      })
      .finally(() => {
        setHydrated(true);
      });
  }, []);

  const handleLoginWithEmail = async (login: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data: AuthResponse = await loginWithEmail({ login, password });
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithPin = async (pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const data: AuthResponse = await loginWithPin({ pin });
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        hydrated,
        error,
        loginWithEmail: handleLoginWithEmail,
        loginWithPin: handleLoginWithPin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
