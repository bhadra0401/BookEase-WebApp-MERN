import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  approvedByAdmin: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

reviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);