import { create } from 'zustand';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  isApproved: boolean;
  phone?: string;
  address?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    set({ user, token });
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, token });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null });
      throw error;
    }
  },

  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    set({ user: response.data.user });
  }
}));