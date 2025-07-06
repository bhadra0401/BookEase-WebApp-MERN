import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Package, Eye, Calendar, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await api.get('/orders/my-orders');
      return response.data;
    }
  });

  // NEW: Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const openReviewModal = (bookId: string) => {
    setSelectedBookId(bookId);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setSelectedBookId(null);
    setRating(5);
    setTitle('');
    setComment('');
    setReviewModalOpen(false);
  };

  const submitReview = async () => {
    if (!selectedBookId) return;
    try {
      await api.post('/reviews', {
        bookId: selectedBookId,
        rating,
        title,
        comment,
      });
      toast.success('Review submitted successfully');
      closeReviewModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

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
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link
            to="/books"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order: any) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order.trackingId}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {order.books.slice(0, 3).map((book: any, index: number) => (
                  <div key={index} className="flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-3">
                      <img src={book.imageUrl} alt={book.title} className="w-12 h-16 object-cover rounded" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                        <p className="text-xs text-gray-600">
                          Qty: {book.quantity} × ₹{book.price}
                        </p>
                      </div>
                    </div>

                    {/* NEW: Review button */}
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => openReviewModal(book.bookId)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                ))}
                {order.books.length > 3 && (
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    +{order.books.length - 3} more items
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600 mb-2 sm:mb-0">
                  <MapPin className="h-4 w-4 mr-1" />
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">₹{order.totalPrice}</p>
                </div>
              </div>

              {order.expectedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Expected delivery: {new Date(order.expectedDelivery).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}

              {order.status === 'delivered' && order.deliveredAt && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* NEW: Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>

            <label className="block text-sm font-medium mb-1">Rating (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full mb-3 border px-3 py-2 rounded"
            />

            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-3 border px-3 py-2 rounded"
            />

            <label className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full mb-4 border px-3 py-2 rounded"
            />

            <div className="flex justify-end space-x-2">
              <button onClick={closeReviewModal} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={submitReview} className="px-4 py-2 bg-blue-600 text-white rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
