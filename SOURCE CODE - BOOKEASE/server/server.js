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
import Book from './models/Book.js'; 

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
  await createDemoBooks();

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
const createDemoBooks = async () => {
  try {
    const count = await Book.countDocuments();
    if (count > 0) {
      console.log('📚 Demo books already exist');
      return;
    }

    // Get an existing seller (or admin) to assign as sellerId
    const seller = await User.findOne({ role: 'seller' }) || await User.findOne({ role: 'admin' });
    if (!seller) {
      console.log('❌ No seller or admin found to assign demo books');
      return;
    }
    const demoBooks = [
      {
        title: 'The Alchemist',
        description: 'A boy’s mystical journey to follow his dream.',
        author: 'Paulo Coelho',
        price: 299,
        originalPrice: 399,
        stock: 25,
        category: 'Fiction',
        imageUrl: 'https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg',
        sellerId: seller._id,
        isbn: '9780061122415',
        language: 'English',
        pages: 208,
        publisher: 'HarperOne',
        publicationDate: new Date('1993-05-01')
      },
      {
        title: 'Atomic Habits',
        description: 'A proven system to build good habits and break bad ones.',
        author: 'James Clear',
        price: 350,
        originalPrice: 499,
        stock: 30,
        category: 'Self-Help',
        imageUrl: 'https://m.media-amazon.com/images/I/91bYsX41DVL.jpg',
        sellerId: seller._id,
        isbn: '9780735211292',
        language: 'English',
        pages: 320,
        publisher: 'Avery',
        publicationDate: new Date('2018-10-16')
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        description: 'An exploration of human evolution and history.',
        author: 'Yuval Noah Harari',
        price: 450,
        originalPrice: 600,
        stock: 15,
        category: 'History',
        imageUrl: 'https://m.media-amazon.com/images/I/713jIoMO3UL.jpg',
        sellerId: seller._id,
        isbn: '9780062316097',
        language: 'English',
        pages: 464,
        publisher: 'Harper',
        publicationDate: new Date('2015-02-10')
      }
    ];

    await Book.insertMany(demoBooks);
    console.log('📚 Demo books inserted successfully');
  } catch (err) {
    console.error('❌ Error inserting demo books:', err.message);
  }
};
