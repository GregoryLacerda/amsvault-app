import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import LocalApiService from '../services/localApi';
import { User, LoginRequest, CreateUserRequest } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signUp: (userData: CreateUserRequest) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    initializeAndLoadData();
  }, []);

  async function initializeAndLoadData() {
    try {
      // Inicializar banco de dados
      await LocalApiService.initialize();
      
      // Tentar carregar usuário salvo
      const storedUser = await LocalApiService.getUser();
      if (storedUser) {
        setUser(storedUser);
        setUserEmail(storedUser.email);
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
      await LocalApiService.clearUser();
    } finally {
      setLoading(false);
    }
  }

  async function signIn(credentials: LoginRequest) {
    try {
      const response = await LocalApiService.login(credentials.email, credentials.password);
      setUser(response.user);
      setUserEmail(response.user.email);
    } catch (error) {
      throw error;
    }
  }

  async function signUp(userData: CreateUserRequest) {
    try {
      const response = await LocalApiService.register(userData.name, userData.email, userData.password);
      setUser(response.user);
      setUserEmail(response.user.email);
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    await LocalApiService.logout();
    setUser(null);
    setUserEmail(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
