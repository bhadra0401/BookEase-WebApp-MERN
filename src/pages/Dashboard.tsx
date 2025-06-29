import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Package, Heart, ShoppingCart, User, Star, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch user's recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const response = await api.get('/orders/my-orders?limit=3');
      return response.data;
    }
  });

  // Fetch wishlist count
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist-count'],
    queryFn: async () => {
      const response = await api.get('/wishlist');
      return response.data;
    }
  });

  // Fetch cart count
  const { data: cartData } = useQuery({
    queryKey: ['cart-count'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'packing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'out-for-delivery':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Here's what's happening with your account</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentOrders ? recentOrders.length : 0}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {wishlistData ? wishlistData.length : 0}
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/cart"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cart Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {cartData ? cartData.reduce((sum: number, item: any) => sum + item.quantity, 0) : 0}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/orders"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.slice(0, 3).map((order: any) => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">#{order.trackingId}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{order.books.length} items</span>
                    <span>₹{order.totalPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders yet</p>
              <Link
                to="/books"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start shopping
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <Link
              to="/books"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Browse Books</span>
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Heart className="h-5 w-5 text-red-600 mr-3" />
              <span className="font-medium text-gray-900">View Wishlist</span>
            </Link>

            <Link
              to="/cart"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">View Cart</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium text-gray-900">Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Account Status */}
      {user?.role === 'seller' && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Account Status</h2>
          
          {user.isApproved ? (
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="bg-green-100 rounded-full p-2">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-green-800">Account Approved</p>
                <p className="text-sm text-green-600">You can now start selling books on BookEase</p>
              </div>
              <Link
                to="/seller"
                className="ml-auto bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                Go to Seller Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="bg-yellow-100 rounded-full p-2">
                <Package className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-yellow-800">Pending Approval</p>
                <p className="text-sm text-yellow-600">Your seller account is under review. You'll be notified once approved.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;