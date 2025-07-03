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

// 🔐 Load from .env
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || 'admin@bookease.com';
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log(`✅ Connected to MongoDB: ${MONGO_URI}`);

  // 🔐 Create demo admin
  await createDemoAdmin();

  // Start server
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

// 👇 Create demo admin
const createDemoAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: DEMO_ADMIN_EMAIL });

    if (!existingAdmin) {
      const admin = new User({
        name: 'Demo Admin',
        email: DEMO_ADMIN_EMAIL,
        password: DEMO_ADMIN_PASSWORD, // should be hashed in model
        role: 'admin'
      });

      await admin.save();
      console.log(`✅ Demo admin created: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`);
    } else {
      console.log('✅ Demo admin already exists');
    }
  } catch (err) {
    console.error('❌ Error creating demo admin:', err.message);
  }
};
