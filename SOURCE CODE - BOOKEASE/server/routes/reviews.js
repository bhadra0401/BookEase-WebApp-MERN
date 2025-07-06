import express from 'express';
import Review from '../models/Review.js';
import Book from '../models/Book.js';
import Order from '../models/Order.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Add review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bookId, rating, comment, title } = req.body;

    // Check if user has purchased this book
    const hasPurchased = await Order.findOne({
      userId: req.user._id,
      'books.bookId': bookId,
      status: 'delivered'
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review books you have purchased' });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      userId: req.user._id,
      bookId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = new Review({
      userId: req.user._id,
      bookId,
      rating,
      comment,
      title
    });

    await review.save();

    // Update book's average rating
    await updateBookRating(bookId);

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name');

    res.status(201).json({
      message: 'Review added successfully',
      review: populatedReview
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
});

// Get reviews for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({
      bookId: req.params.bookId,
      approvedByAdmin: true
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

// Approve review (Admin only)
router.put('/approve/:reviewId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { approvedByAdmin: true },
      { new: true }
    ).populate('userId', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update book's average rating
    await updateBookRating(review.bookId);

    res.json({
      message: 'Review approved successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve review', error: error.message });
  }
});

// Get all reviews (Admin only)
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('bookId', 'title author')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

// Helper function to update book rating
async function updateBookRating(bookId) {
  const reviews = await Review.find({ bookId, approvedByAdmin: true });
  
  if (reviews.length === 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      totalReviews: 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Book.findByIdAndUpdate(bookId, {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length
  });
}

export default router;