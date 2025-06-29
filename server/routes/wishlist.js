import express from 'express';
import WishlistItem from '../models/Wishlist.js';
import Book from '../models/Book.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const wishlistItems = await WishlistItem.find({ userId: req.user._id })
      .populate('bookId', 'title author price imageUrl stock isActive averageRating')
      .sort({ createdAt: -1 });

    // Filter out inactive books
    const activeWishlistItems = wishlistItems.filter(item => item.bookId && item.bookId.isActive);

    res.json(activeWishlistItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
});

// Add to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const existingWishlistItem = await WishlistItem.findOne({
      userId: req.user._id,
      bookId
    });

    if (existingWishlistItem) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }

    const wishlistItem = new WishlistItem({
      userId: req.user._id,
      bookId
    });

    await wishlistItem.save();

    const populatedWishlistItem = await WishlistItem.findById(wishlistItem._id)
      .populate('bookId', 'title author price imageUrl stock averageRating');

    res.status(201).json({
      message: 'Item added to wishlist',
      wishlistItem: populatedWishlistItem
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }
    res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
  }
});

// Remove from wishlist
router.delete('/:bookId', authenticateToken, async (req, res) => {
  try {
    const wishlistItem = await WishlistItem.findOneAndDelete({
      bookId: req.params.bookId,
      userId: req.user._id
    });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
  }
});

// Check if book is in wishlist
router.get('/check/:bookId', authenticateToken, async (req, res) => {
  try {
    const wishlistItem = await WishlistItem.findOne({
      userId: req.user._id,
      bookId: req.params.bookId
    });

    res.json({ inWishlist: !!wishlistItem });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check wishlist', error: error.message });
  }
});

export default router;