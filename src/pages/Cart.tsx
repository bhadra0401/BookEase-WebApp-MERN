import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, fetchCart } = useCartStore();

  // Fetch cart on component mount
  useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const totalPrice = getTotalPrice();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any books to your cart yet.</p>
          <Link
            to="/books"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Cart Items ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item._id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <Link to={`/books/${item.bookId._id}`} className="flex-shrink-0">
                      <img
                        src={item.bookId.imageUrl}
                        alt={item.bookId.title}
                        className="w-20 h-28 object-cover rounded-md"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link to={`/books/${item.bookId._id}`}>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                          {item.bookId.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">by {item.bookId.author}</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">₹{item.bookId.price}</p>

                      {/* Stock Warning */}
                      {item.bookId.stock < item.quantity && (
                        <p className="text-sm text-red-600 mt-1">
                          Only {item.bookId.stock} left in stock
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          disabled={item.quantity >= item.bookId.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      {/* Item Total */}
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(item.bookId.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="text-gray-900">₹{totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6 block text-center"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/books"
              className="w-full text-blue-600 hover:text-blue-700 px-6 py-3 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors mt-3 block text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;