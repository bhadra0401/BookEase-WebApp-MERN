import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Package, Eye, Calendar, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';

const SellerOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await api.get('/orders/seller/orders');
      return response.data;
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order status');
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

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'ordered': 'confirmed',
      'confirmed': 'packing',
      'packing': 'shipped',
      'shipped': 'out-for-delivery',
      'out-for-delivery': 'delivered'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Orders</h2>
        <p className="text-sm text-gray-600">Manage orders for your books</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {orders.map((order: any) => (
            <div key={order._id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order.trackingId}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <User className="h-4 w-4 mr-1" />
                <span>{order.userId.name} ({order.userId.email})</span>
              </div>

              {/* Shipping Address */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
              </div>

              {/* Order Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {order.books.slice(0, 3).map((book: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {book.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        Qty: {book.quantity} × ₹{book.price}
                      </p>
                    </div>
                  </div>
                ))}
                {order.books.length > 3 && (
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    +{order.books.length - 3} more items
                  </div>
                )}
              </div>

              {/* Order Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">₹{order.totalPrice}</p>
                </div>
                
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="flex space-x-2">
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                        disabled={updateOrderStatusMutation.isPending}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Mark as {formatStatus(getNextStatus(order.status))}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Orders for your books will appear here</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details - #{selectedOrder.trackingId}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrder.userId.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.userId.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                  <div className="text-sm text-gray-700">
                    <p>{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p>{selectedOrder.shippingAddress.zipCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.books.map((book: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{book.title}</h5>
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

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">₹{selectedOrder.totalPrice}</span>
                </div>
              </div>

              {/* Status Update Actions */}
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Update Order Status</h4>
                  <div className="flex space-x-2">
                    {getNextStatus(selectedOrder.status) && (
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedOrder._id, getNextStatus(selectedOrder.status));
                          setSelectedOrder(null);
                        }}
                        disabled={updateOrderStatusMutation.isPending}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Mark as {formatStatus(getNextStatus(selectedOrder.status))}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;