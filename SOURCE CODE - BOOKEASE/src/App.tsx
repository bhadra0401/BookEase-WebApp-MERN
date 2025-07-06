import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AddBook from './components/seller/AddBook';
import SellerOrders from './components/seller/SellerOrders';
import SellerAnalytics from './components/seller/SellerAnalytics';
import SellerBooks from './components/seller/SellerBooks';
import AdminReviews from './components/admin/AdminReviews';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              

              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="books" element={<Books />} />
                <Route path="books/:id" element={<BookDetail />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="cart" element={<Cart />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="dashboard" element={<Dashboard />} />
                </Route>
                <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="admin/add-book" element={<AddBook />} />
                
              </Route>

                <Route element={<ProtectedRoute roles={['seller']} />}>
  <Route path="seller" element={<SellerDashboard />}>
    <Route index element={<SellerBooks />} />
    <Route path="add-book" element={<AddBook />} />
    <Route path="orders" element={<SellerOrders />} />
    <Route path="analytics" element={<SellerAnalytics />} />
  </Route>
</Route>




                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route path="admin/*" element={<AdminDashboard />} />
                  <Route path="reviews" element={<AdminReviews />} />

                </Route>
              </Route>
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;