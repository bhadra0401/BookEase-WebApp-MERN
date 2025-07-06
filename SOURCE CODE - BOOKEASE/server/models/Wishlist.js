import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  }
}, {
  timestamps: true
});

wishlistItemSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.model('WishlistItem', wishlistItemSchema);