# 📚 BookEase – MERN Stack Book Store App

BookEase is a full-featured online bookstore built with the **MERN stack (MongoDB, Express, React, Node.js)**. It supports multiple user roles (User, Seller, Admin) with full authentication, book management, order placement, and admin controls.

---

## 🚀 Live Demo

🌐 Frontend: _Add your Vercel/Netlify link here_  
🛠 Backend API: _Add your Render/other API link here_

---

## 📌 Features

### 👤 User (Customer)
- Browse, search, and view books
- Add to Wishlist or Cart
- Place orders with address details
- View past orders and their status
- Leave ratings & reviews on delivered books

### 🛒 Seller
- Seller registration and login
- Add/edit/delete their books
- Manage orders placed on their books
- View analytics of their sales

### 🛠 Admin
- Admin login
- Manage all books, sellers, and users
- View all orders and platform-wide analytics
- Approve book reviews before they go live

---

## 🖥 Tech Stack

### ⚙️ Backend
- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- JWT Authentication
- Multer (for image uploads)
- RESTful APIs

### 💻 Frontend
- **React + Vite**
- **TypeScript**
- **Tailwind CSS**
- React Router
- Zustand (Global State)
- TanStack React Query
- react-hot-toast, lucide-react (UI/UX)

---

## 🔐 Authentication & Authorization

- JWT-based auth for all user types
- Protected routes based on roles (`User`, `Seller`, `Admin`)
- Token verification in backend middleware

---

## 📁 Project Structure

```bash
project/
├── backend/             # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── frontend/            # React + Vite frontend
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   ├── stores/
│   ├── App.tsx
│   └── main.tsx
│
├── .env                 # Backend environment file
├── README.md
```

---

## 🔧 Setup Instructions

### 📦 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
PORT=5000
```

Run the server:

```bash
npm run dev
```

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🛡 .env Examples

### `.env` (Backend)

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bookease
JWT_SECRET=supersecuresecret
PORT=5000
```

### `.env` (Frontend)

```env
VITE_API_URL=https://your-api.onrender.com
```

---

## 📸 Screenshots

### ✅ Admin Dashboard  
![Admin Dashboard](https://via.placeholder.com/600x300)

### 🛒 Seller Portal  
![Seller Dashboard](https://via.placeholder.com/600x300)

### 📚 User Browsing Books  
![User Browsing](https://via.placeholder.com/600x300)

---

## 🤝 Contribution

PRs are welcome! If you'd like to contribute:
- Fork the repo
- Create a new branch
- Submit a PR with clear message

---

## 📄 License

MIT License

---

## 💡 Author

**Akkala Bhadra Kumar**  
📧 _Add your email here_  
🔗 [LinkedIn](https://linkedin.com/in/yourusername) | [GitHub](https://github.com/yourusername)
