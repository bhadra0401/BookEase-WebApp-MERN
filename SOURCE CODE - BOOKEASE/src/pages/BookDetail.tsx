import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Star, Heart, ShoppingCart, Minus, Plus, ArrowLeft, User } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  // Fetch book details
  const { data: book, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const response = await api.get(`/books/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const response = await api.get(`/reviews/book/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    
    if (isInWishlist(book._id)) {
      removeFromWishlist(book._id);
    } else {
      addToWishlist(book._id);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    
    addToCart(book._id, quantity);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 aspect-w-3 aspect-h-4 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h1>
          <Link to="/books" className="text-blue-600 hover:text-blue-700">
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/books"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Books
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Book Image */}
        <div className="flex justify-center">
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full max-w-md h-auto object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Book Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-2">by {book.author}</p>
            <p className="text-sm text-gray-500">{book.category}</p>
          </div>

          {/* Rating */}
          {book.averageRating > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(book.averageRating)}
              </div>
              <span className="text-sm text-gray-600">
                {book.averageRating} ({book.totalReviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-blue-600">₹{book.price}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-xl text-gray-500 line-through">₹{book.originalPrice}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              book.stock > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>

          {/* Book Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {book.isbn && (
              <div>
                <span className="font-medium text-gray-900">ISBN:</span>
                <span className="text-gray-600 ml-2">{book.isbn}</span>
              </div>
            )}
            {book.pages && (
              <div>
                <span className="font-medium text-gray-900">Pages:</span>
                <span className="text-gray-600 ml-2">{book.pages}</span>
              </div>
            )}
            {book.language && (
              <div>
                <span className="font-medium text-gray-900">Language:</span>
                <span className="text-gray-600 ml-2">{book.language}</span>
              </div>
            )}
            {book.publisher && (
              <div>
                <span className="font-medium text-gray-900">Publisher:</span>
                <span className="text-gray-600 ml-2">{book.publisher}</span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {book.stock > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-900">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <button
              onClick={handleWishlistToggle}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Heart 
                className={`h-5 w-5 mr-2 ${isInWishlist(book._id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
              />
              {isInWishlist(book._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Seller Info */}
          {book.sellerId && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{book.sellerId.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {reviews && reviews.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{review.userId.name}</span>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;