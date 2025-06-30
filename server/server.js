import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to local MongoDB
mongoose.connect('mongodb://localhost:27017/Book-Ease', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to local MongoDB at Book-Ease');

  // 🔐 Create default demo admin after DB is connected
  await createDemoAdmin();

  // ✅ Start server only after DB + admin setup
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'BookEase API Server Running!' });
});

// 👇 Create demo admin function
const createDemoAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@bookease.com' });

    if (!existingAdmin) {
      const admin = new User({
        name: 'Demo Admin',
        email: 'admin@bookease.com',
        password: 'admin123', // will be hashed
        role: 'admin'
      });

      await admin.save();
      console.log('✅ Demo admin created: admin@bookease.com / admin123');
    } else {
      console.log('✅ Demo admin already exists');
    }
  } catch (err) {
    console.error('❌ Error creating demo admin:', err.message);
  }
};

