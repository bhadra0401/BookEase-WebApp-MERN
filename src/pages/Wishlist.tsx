import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';

const Wishlist: React.FC = () => {
  const { items, removeFromWishlist, fetchWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  // Fetch wishlist on component mount
  useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist
  });

  const handleMoveToCart = (bookId: string) => {
    addToCart(bookId);
    removeFromWishlist(bookId);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save books you love for later by adding them to your wishlist.</p>
          <Link
            to="/books"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="relative">
              <Link to={`/books/${item.bookId._id}`}>
                <img
                  src={item.bookId.imageUrl}
                  alt={item.bookId.title}
                  className="w-full h-64 object-cover"
                />
              </Link>
              <button
                onClick={() => removeFromWishlist(item.bookId._id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                title="Remove from wishlist"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            </div>
            
            <div className="p-4">
              <Link to={`/books/${item.bookId._id}`}>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
                  {item.bookId.title}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 mb-2">by {item.bookId.author}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-blue-600">₹{item.bookId.price}</span>
                {item.bookId.averageRating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{item.bookId.averageRating}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleMoveToCart(item.bookId._id)}
                  disabled={item.bookId.stock === 0}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {item.bookId.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                </button>
                
                <Link
                  to={`/books/${item.bookId._id}`}
                  className="w-full text-blue-600 hover:text-blue-700 px-4 py-2 rounded-md font-medium border border-blue-600 hover:bg-blue-50 transition-colors block text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;