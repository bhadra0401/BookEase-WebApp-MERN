import express from 'express';
import Book from '../models/Book.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all books with filtering and search
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      author,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const books = await Book.find(query)
      .populate('sellerId', 'name')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Book.countDocuments(query);

    res.json({
      books,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBooks: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('sellerId', 'name email phone');
    
    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch book', error: error.message });
  }
});

// Create book (Seller/Admin only)
router.post('/', authenticateToken, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      sellerId: req.user._id
    };

    const book = new Book(bookData);
    await book.save();

    const populatedBook = await Book.findById(book._id).populate('sellerId', 'name');
    
    res.status(201).json({
      message: 'Book created successfully',
      book: populatedBook
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create book', error: error.message });
  }
});

// Update book (Seller/Admin only)
router.put('/:id', authenticateToken, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Sellers can only update their own books
    if (req.user.role === 'seller' && book.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('sellerId', 'name');

    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
});

// Delete book (Seller/Admin only)
router.delete('/:id', authenticateToken, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Sellers can only delete their own books
    if (req.user.role === 'seller' && book.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    await Book.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
});

// Get seller's books
router.get('/seller/my-books', authenticateToken, requireRole('seller'), async (req, res) => {
  try {
    const books = await Book.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch seller books', error: error.message });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Book.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

export default router;