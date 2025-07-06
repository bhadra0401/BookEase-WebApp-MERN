import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (data: any) => Promise<any>; // ✅ Added
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authStore = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await authStore.checkAuth();
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await authStore.login(email, password);
  };

  const register = async (userData: any) => {
    await authStore.register(userData);
  };

  const logout = () => {
    authStore.logout();
    localStorage.removeItem('token');
  };

  // ✅ New: updateProfile function
  const updateProfile = async (data: any) => {
  await authStore.updateProfile(data); // ✅ Call store's method
};


  return (
    <AuthContext.Provider
      value={{
        user: authStore.user,
        login,
        register,
        logout,
        isLoading,
        updateProfile, // ✅ Add to context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
