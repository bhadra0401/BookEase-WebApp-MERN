import express from 'express';
import Order from '../models/Order.js';
import CartItem from '../models/Cart.js';
import Book from '../models/Book.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Place order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'COD' } = req.body;

    // Get user's cart
    const cartItems = await CartItem.find({ userId: req.user._id })
      .populate('bookId', 'title author price imageUrl stock sellerId isActive');


    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalPrice = 0;
    const orderBooks = [];

    // Validate stock and calculate total
    for (const cartItem of cartItems) {
      const book = cartItem.bookId;
      
      if (!book || !book.isActive) {
        return res.status(400).json({ message: `Book ${book?.title || 'Unknown'} is no longer available` });
      }

      if (book.stock < cartItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${book.title}` });
      }

      const itemTotal = book.price * cartItem.quantity;
      totalPrice += itemTotal;

      orderBooks.push({
        bookId: book._id,
        quantity: cartItem.quantity,
        price: book.price,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl
      });
    }

    // Create order
    const order = new Order({
      userId: req.user._id,
      books: orderBooks,
      shippingAddress,
      totalPrice,
      paymentMethod
    });

    await order.save();

    // Update book stock
    for (const cartItem of cartItems) {
      await Book.findByIdAndUpdate(
        cartItem.bookId._id,
        { $inc: { stock: -cartItem.quantity } }
      );
    }

    // Clear cart
    await CartItem.deleteMany({ userId: req.user._id });

    const populatedOrder = await Order.findById(order._id)
      .populate('books.bookId', 'title author imageUrl')
      .populate('userId', 'name email');

    res.status(201).json({
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('books.bookId', 'title author imageUrl')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('books.bookId', 'title author imageUrl sellerId')
      .populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is seller/admin
    const isOwner = order.userId._id.toString() === req.user._id.toString();
    const isSeller = req.user.role === 'seller' && 
      order.books.some(book => book.bookId.sellerId.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// Update order status (Seller/Admin only)
router.put('/:id/status', authenticateToken, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'packing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id)
      .populate('books.bookId', 'sellerId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Sellers can only update orders for their books
    if (req.user.role === 'seller') {
      const canUpdate = order.books.some(book => 
        book.bookId.sellerId.toString() === req.user._id.toString()
      );
      
      if (!canUpdate) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// Get seller's orders
router.get('/seller/orders', authenticateToken, requireRole('seller'), async (req, res) => {
  try {
    const orders = await Order.find({
      'books.bookId': {
        $in: await Book.find({ sellerId: req.user._id }).distinct('_id')
      }
    })
    .populate('books.bookId', 'title author imageUrl')
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch seller orders', error: error.message });
  }
});

export default router;