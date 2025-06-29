import express from 'express';
import CartItem from '../models/Cart.js';
import Book from '../models/Book.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.user._id })
      .populate('bookId', 'title author price imageUrl stock isActive')
      .sort({ createdAt: -1 });

    // Filter out inactive books
    const activeCartItems = cartItems.filter(item => item.bookId && item.bookId.isActive);

    res.json(activeCartItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
});

// Add to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const existingCartItem = await CartItem.findOne({
      userId: req.user._id,
      bookId
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (book.stock < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      
      existingCartItem.quantity = newQuantity;
      await existingCartItem.save();

      const updatedItem = await CartItem.findById(existingCartItem._id)
        .populate('bookId', 'title author price imageUrl stock');

      return res.json({
        message: 'Cart updated successfully',
        cartItem: updatedItem
      });
    }

    const cartItem = new CartItem({
      userId: req.user._id,
      bookId,
      quantity
    });

    await cartItem.save();

    const populatedCartItem = await CartItem.findById(cartItem._id)
      .populate('bookId', 'title author price imageUrl stock');

    res.status(201).json({
      message: 'Item added to cart',
      cartItem: populatedCartItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to cart', error: error.message });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('bookId');

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.bookId.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const updatedItem = await CartItem.findById(cartItem._id)
      .populate('bookId', 'title author price imageUrl stock');

    res.json({
      message: 'Cart updated successfully',
      cartItem: updatedItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
});

// Remove from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from cart', error: error.message });
  }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await CartItem.deleteMany({ userId: req.user._id });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
});

export default router;