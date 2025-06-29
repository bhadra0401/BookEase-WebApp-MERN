import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { TrendingUp, DollarSign, Package, Star, BookOpen, Users } from 'lucide-react';

const SellerAnalytics: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['seller-analytics'],
    queryFn: async () => {
      const [booksRes, ordersRes] = await Promise.all([
        api.get('/books/seller/my-books'),
        api.get('/orders/seller/orders')
      ]);

      const books = booksRes.data;
      const orders = ordersRes.data;

      // Calculate analytics
      const totalBooks = books.length;
      const totalOrders = orders.length;
      const totalRevenue = orders
        .filter((order: any) => order.status === 'delivered')
        .reduce((sum: number, order: any) => sum + order.totalPrice, 0);

      const averageRating = books.length > 0 
        ? books.reduce((sum: number, book: any) => sum + (book.averageRating || 0), 0) / books.length 
        : 0;

      const totalReviews = books.reduce((sum: number, book: any) => sum + (book.totalReviews || 0), 0);

      // Monthly sales data
      const monthlySales = orders.reduce((acc: any, order: any) => {
        const month = new Date(order.createdAt).toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!acc[month]) {
          acc[month] = { revenue: 0, orders: 0 };
        }
        
        if (order.status === 'delivered') {
          acc[month].revenue += order.totalPrice;
        }
        acc[month].orders += 1;
        
        return acc;
      }, {});

      // Top performing books
      const topBooks = books
        .sort((a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 5);

      // Recent orders
      const recentOrders = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return {
        overview: {
          totalBooks,
          totalOrders,
          totalRevenue,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews
        },
        monthlySales: Object.entries(monthlySales).map(([month, data]: [string, any]) => ({
          month,
          ...data
        })),
        topBooks,
        recentOrders
      };
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalBooks}</p>
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
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalOrders}</p>
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
              <p className="text-2xl font-bold text-gray-900">₹{analytics.overview.totalRevenue.toFixed(2)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageRating || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalReviews}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Performance</h3>
          {analytics.monthlySales.length > 0 ? (
            <div className="space-y-3">
              {analytics.monthlySales.slice(-6).map((month: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{month.month}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{month.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{month.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data available</p>
          )}
        </div>

        {/* Top Performing Books */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Rated Books</h3>
          {analytics.topBooks.length > 0 ? (
            <div className="space-y-3">
              {analytics.topBooks.map((book: any, index: number) => (
                <div key={book._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{book.title}</p>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {book.averageRating > 0 ? book.averageRating : 'No ratings'}
                      </span>
                      {book.totalReviews > 0 && (
                        <span className="text-xs text-gray-500 ml-1">({book.totalReviews})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{book.price}</p>
                    <p className="text-xs text-gray-600">{book.stock} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No books available</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
        {analytics.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.recentOrders.map((order: any) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.trackingId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.userId.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.totalPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent orders</p>
        )}
      </div>
    </div>
  );
};

export default SellerAnalytics;