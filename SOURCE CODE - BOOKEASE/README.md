# 📚 BookEase – MERN Stack Book Store App

BookEase is a full-featured online bookstore built with the **MERN stack** (MongoDB, Express, React, Node.js). It supports **role-based access** for Users, Sellers, and Admins with authentication, book browsing, order management, and powerful admin controls.

---

## ✅ Prerequisites

### 📦 1. Install Node.js & npm
- Download from 👉 https://nodejs.org/
- Verify installation:
  ```bash
  node -v
  npm -v
  ```

### 🛢 2. Install MongoDB

#### Option A: Local MongoDB
- Download MongoDB Community Server:  
  👉 https://www.mongodb.com/try/download/community
- After installation, start MongoDB:
  ```bash
  mongod
  ```

#### Option B: MongoDB Atlas (Cloud)
- Go to 👉 https://cloud.mongodb.com/
- Create a cluster
- Whitelist your IP & create a database user
- Copy the connection URI (see below)

---

## 🚀 Project Setup

### 🔄 Clone the Repository

```bash
git clone https://github.com/bhadra0401/BookEase-WebApp-MERN.git
cd BookEase-WebApp-MERN
cd SOURCE CODE - BOOKEASE
```

---

## 🌍 MongoDB Connection Types

Choose one connection string in your `.env` file:

| Deployment Type      | Connection String Example                                               | Status                   |
|----------------------|-------------------------------------------------------------------------|--------------------------|
| **1. Local MongoDB** | `mongodb://127.0.0.1:27017/BookStore` or `localhost:27017`              | ✅ **Active & Commented** |
| **2. Cloud (Atlas)** | `mongodb+srv://elf:elf123@myprojects.inzgx1q.mongodb.net/BookStore?...` | ✅ **Commented**          |

---

## 🔐 Backend Setup

### 📁 `server/.env`

```env
# ✅ Local MongoDB - Active
MONGO_URI=mongodb://127.0.0.1:27017/Book-Ease

# 🌐 MongoDB Atlas - Use only if deploying on cloud
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.<cluster-id>.mongodb.net/Book-Ease?retryWrites=true&w=majority

PORT=5000
JWT_SECRET=supersecretjwtkey

# Demo Admin (Auto Created)
DEMO_ADMIN_EMAIL=admin@bookease.com
DEMO_ADMIN_PASSWORD=admin123
```

> ✅ Only **one** MONGO_URI should be active at a time.

---

### 📦 Install Node Modules in Backend

```bash
cd server
npm install
```


---

## 💻 Frontend Setup

### 📁 `src/.env`

```env
# Development (local backend)
VITE_API_URL=http://localhost:5000/api

# Production (Render)
# VITE_API_URL=https://your-backend.onrender.com/api
```

---

### 📦 Install & Run Frontend

```bash
cd..
cd src
npm install
npm run dev
```

✅ The frontend will run at: `http://localhost:5173`
✅ The backend will run at: `http://localhost:5000`

✅ A demo admin will be auto-created with:
```
Email: admin@bookease.com
Password: admin123
```
---

## 👤 User Roles & Features

### 👨‍💼 User
- Browse/search/view books
- Add to cart and wishlist
- Place and track orders
- Review delivered books

### 🛍 Seller
- Add/edit/delete books
- Manage orders
- View sales analytics

### 🔧 Admin
- Manage all users and books
- Approve reviews and sellers
- View analytics dashboard

---

## 🧰 Tech Stack

| Layer       | Tech                                     |
|-------------|------------------------------------------|
| Frontend    | React, Vite, TypeScript, Tailwind CSS    |
| State Mgmt  | Zustand, TanStack Query                  |
| Backend     | Node.js, Express                         |
| Database    | MongoDB (Local or Atlas)                 |
| Auth        | JWT                                      |
| UI Libs     | lucide-react, react-hot-toast            |

---

## 📁 Project Structure

```bash
BookEase-WebApp-MERN/
├── server/         # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── client/         # Vite + React frontend
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── hooks/
│   └── App.tsx, main.tsx
│
└── README.md
```

---

## 🧪 Development Scripts

```bash
# Run Backend
cd server
npm install

# Run Frontend
cd..
cd src
npm install
npm run dev
```

---

## ☁️ Deployment (Optional)

### 🔹 Backend (Render)
- Push to GitHub
- Go to 👉 https://render.com/
- Create a new **Web Service**
- Use build command:
  ```bash
  cd server && npm install && npm start
  ```
- Set environment variables:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `DEMO_ADMIN_EMAIL`
  - `DEMO_ADMIN_PASSWORD`

### 🔹 Frontend (Netlify or Vercel)
- Deploy the `client/` folder
- Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
- Set:
  - Build command: `npm run build`
  - Output directory: `dist`

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Akkala Bhadra Kumar**  
📧 238x1a0503@khitguntur.ac.in  
🔗 [GitHub](https://github.com/bhadra0401)  
🔗 [LinkedIn](https://www.linkedin.com/in/akkala-naga-veera-bhadra-kumar-161640252)
