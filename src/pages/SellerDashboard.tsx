import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  BookOpen, 
  Plus, 
  Package, 
  BarChart3, 
  Settings,
  TrendingUp,
  DollarSign,
  Users,
  Star
} from 'lucide-react';
import SellerBooks from '../components/seller/SellerBooks';
import AddBook from '../components/seller/AddBook';
import SellerOrders from '../components/seller/SellerOrders';
import SellerAnalytics from '../components/seller/SellerAnalytics';
import { Outlet } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const location = useLocation();


  // Fetch seller stats
const { data: stats } = useQuery({
  queryKey: ['seller-stats'],
  queryFn: async () => {
    const [booksRes, ordersRes] = await Promise.all([
      api.get('/books/seller/my-books'),
      api.get('/orders/seller/orders')
    ]);

    const books = booksRes.data;
    const orders = ordersRes.data;

    const totalRevenue = orders
      .filter((order: any) => order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + order.totalPrice, 0);

    const totalOrders = orders.length;
    const averageRating = books.length > 0
      ? books.reduce((sum: number, book: any) => sum + (book.averageRating || 0), 0) / books.length
      : 0;

    return {
      totalBooks: books.length,
      totalOrders,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10
    };
  },
  staleTime: 0,           // ✅ Always refetch when accessed
  refetchOnMount: true    // ✅ Ensures fresh fetch on component mount
});


  const navigation = [
    { name: 'My Books', href: '/seller', icon: BookOpen, current: location.pathname === '/seller' },
    { name: 'Add Book', href: '/seller/add-book', icon: Plus, current: location.pathname === '/seller/add-book' },
    { name: 'Orders', href: '/seller/orders', icon: Package, current: location.pathname === '/seller/orders' },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3, current: location.pathname === '/seller/analytics' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your books, orders, and track your performance</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-lg shadow-md p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />

        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;