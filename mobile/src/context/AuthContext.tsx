import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, saveToken, deleteToken, getUser, saveUser } from '../services/storage';
import api, { setApiErrorListeners } from '../services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  networkError: string | null;
  clearAuthError: () => void;
  clearNetworkError: () => void;
  login: (token: string, user: User) => Promise<void>;
  register: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    setApiErrorListeners(
      (msg) => {
        setAuthError(msg);
        setToken(null);
        setUser(null);
      },
      (msg) => {
        setNetworkError(msg);
      }
    );

    const initAuth = async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken);
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          await saveUser(res.data.user);
        }
      } catch (err) {
        await deleteToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await saveToken(newToken);
    await saveUser(newUser);
    setToken(newToken);
    setUser(newUser);
    setAuthError(null);
    setNetworkError(null);
  };

  const register = async (newToken: string, newUser: User) => {
    await saveToken(newToken);
    await saveUser(newUser);
    setToken(newToken);
    setUser(newUser);
    setAuthError(null);
    setNetworkError(null);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      await deleteToken();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        authError,
        networkError,
        clearAuthError: () => setAuthError(null),
        clearNetworkError: () => setNetworkError(null),
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
