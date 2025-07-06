import { create } from 'zustand';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface WishlistItem {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
    price: number;
    imageUrl: string;
    stock: number;
    averageRating: number;
  };
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (bookId: string) => Promise<void>;
  removeFromWishlist: (bookId: string) => Promise<void>;
  isInWishlist: (bookId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/wishlist');
      set({ items: response.data });
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (bookId: string) => {
    try {
      await api.post('/wishlist/add', { bookId });
      await get().fetchWishlist();
      toast.success('Added to wishlist');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  },

  removeFromWishlist: async (bookId: string) => {
    try {
      await api.delete(`/wishlist/${bookId}`);
      await get().fetchWishlist();
      toast.success('Removed from wishlist');
    } catch (error: any) {
      toast.error('Failed to remove from wishlist');
    }
  },

  isInWishlist: (bookId: string) => {
    const { items } = get();
    return items.some(item => item.bookId._id === bookId);
  }
}));