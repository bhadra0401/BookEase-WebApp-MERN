import express from 'express';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Update user status/role
router.put('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { isActive, isApproved, role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, isApproved, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Get all orders
router.get('/orders', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('books.bookId', 'title author')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Get analytics
router.get('/analytics', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalBooks = await Book.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();

    // Revenue calculation
    const revenueData = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped', 'out-for-delivery'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Popular categories
    const popularCategories = await Book.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Monthly sales
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalCustomers,
        totalSellers,
        totalBooks,
        totalOrders,
        totalRevenue
      },
      recentOrders,
      popularCategories,
      monthlySales
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

// Get all books for admin management
router.get('/books', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const books = await Book.find()
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
});

// Approve/reject seller
router.put('/sellers/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const seller = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'seller' },
      { isApproved },
      { new: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json({
      message: `Seller ${isApproved ? 'approved' : 'rejected'} successfully`,
      seller
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update seller status', error: error.message });
  }
});

export default router;