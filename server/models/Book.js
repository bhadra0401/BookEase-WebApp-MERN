import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String,
    default: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'
  },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'Biography', 'History', 'Romance', 'Mystery', 'Fantasy', 'Self-Help', 'Education', 'Children']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number,
    min: 1
  },
  publisher: String,
  publicationDate: Date,
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', author: 'text', description: 'text' });

export default mongoose.model('Book', bookSchema);