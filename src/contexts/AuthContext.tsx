import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import ApiService from '../services/api';
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
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const token = await ApiService.getToken();
      const storedUser = await ApiService.getUser();
      
      if (token && storedUser) {
        // Tenta buscar dados atualizados da API usando o email armazenado
        const currentUser = await ApiService.getCurrentUser(storedUser.email);
        setUser(currentUser);
        setUserEmail(currentUser.email);
        await ApiService.saveUser(currentUser);
      }
    } catch (error) {
      await ApiService.clearToken();
    } finally {
      setLoading(false);
    }
  }

  async function signIn(credentials: LoginRequest) {
    try {
      const response = await ApiService.login(credentials);
      // Busca dados do usuário usando o email do login
      const currentUser = await ApiService.getCurrentUser(credentials.email);
      setUser(currentUser);
      setUserEmail(currentUser.email);
      await ApiService.saveUser(currentUser);
    } catch (error) {
      throw error;
    }
  }

  async function signUp(userData: CreateUserRequest) {
    try {
      await ApiService.register(userData);
      // Após registrar, fazer login automaticamente
      await signIn({
        email: userData.email,
        password: userData.password,
      });
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    await ApiService.logout();
    setUser(null);
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
