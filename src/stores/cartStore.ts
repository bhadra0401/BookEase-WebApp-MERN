import { create } from 'zustand';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
    price: number;
    imageUrl: string;
    stock: number;
  };
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (bookId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cart');
      set({ items: response.data });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (bookId: string, quantity = 1) => {
    try {
      const response = await api.post('/cart/add', { bookId, quantity });
      await get().fetchCart();
      toast.success('Item added to cart');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await get().fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    }
  },

  removeFromCart: async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await get().fetchCart();
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error('Failed to remove item');
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart');
      set({ items: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  },

  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.bookId.price * item.quantity), 0);
  },

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  }
}));