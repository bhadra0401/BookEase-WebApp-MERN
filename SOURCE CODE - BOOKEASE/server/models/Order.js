import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  books: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    title: String,
    author: String,
    imageUrl: String
  }],
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card', 'UPI', 'NetBanking'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['ordered', 'confirmed', 'packing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'ordered'
  },
  trackingId: {
    type: String,
    unique: true,
    sparse: true
  },
  expectedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

orderSchema.pre('save', function(next) {
  if (!this.trackingId) {
    this.trackingId = 'BKE' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  if (this.status === 'confirmed' && !this.expectedDelivery) {
    this.expectedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }
  if (this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  next();
});

export default mongoose.model('Order', orderSchema);