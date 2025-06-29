import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowLeft, Package, MapPin, Calendar, CreditCard, Truck } from 'lucide-react';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id
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

  const getOrderProgress = (status: string) => {
    const statuses = ['ordered', 'confirmed', 'packing', 'shipped', 'out-for-delivery', 'delivered'];
    const currentIndex = statuses.indexOf(status);
    return currentIndex >= 0 ? currentIndex + 1 : 0;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <Link to="/orders" className="text-blue-600 hover:text-blue-700">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const progress = getOrderProgress(order.status);
  const totalSteps = 6;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/orders"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Orders
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.trackingId}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {formatStatus(order.status)}
              </span>
            </div>

            {/* Order Progress */}
            {order.status !== 'cancelled' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Order Progress</span>
                  <span className="text-sm text-gray-600">{progress}/{totalSteps} steps</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress / totalSteps) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Ordered</span>
                  <span>Confirmed</span>
                  <span>Packing</span>
                  <span>Shipped</span>
                  <span>Out for Delivery</span>
                  <span>Delivered</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.books.map((book: any, index: number) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{book.title}</h3>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Quantity: {book.quantity}</span>
                      <span className="font-medium text-gray-900">₹{book.price} each</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{(book.price * book.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
            </div>
            <div className="text-gray-700">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{order.totalPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center mb-2">
                <CreditCard className="h-4 w-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Payment Method</span>
              </div>
              <p className="text-sm text-gray-600">{order.paymentMethod}</p>
              <p className="text-xs text-gray-500 mt-1">
                Status: {order.paymentStatus}
              </p>
            </div>

            {/* Expected Delivery */}
            {order.expectedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-2">
                  <Truck className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Expected Delivery</span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(order.expectedDelivery).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Delivered */}
            {order.status === 'delivered' && order.deliveredAt && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-2">
                  <Package className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Delivered</span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;