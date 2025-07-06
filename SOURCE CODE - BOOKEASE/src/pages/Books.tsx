import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Heart, ShoppingCart, Filter, Grid, List } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuth } from '../contexts/AuthContext';

const Books: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  // Get current filters from URL
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSort = searchParams.get('sort') || 'createdAt';
  const currentOrder = searchParams.get('order') || 'desc';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Fetch books
  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books', currentSearch, currentCategory, currentPage, currentSort, currentOrder, currentMinPrice, currentMaxPrice],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentSearch) params.set('search', currentSearch);
      if (currentCategory) params.set('category', currentCategory);
      if (currentMinPrice) params.set('minPrice', currentMinPrice);
      if (currentMaxPrice) params.set('maxPrice', currentMaxPrice);
      params.set('page', currentPage.toString());
      params.set('sort', currentSort);
      params.set('order', currentOrder);
      params.set('limit', '12');

      const response = await api.get(`/books?${params.toString()}`);
      return response.data;
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/books/categories/all');
      return response.data;
    }
  });

  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.set('page', '1'); // Reset to first page when filtering
    setSearchParams(newParams);
  };

  const handleWishlistToggle = (bookId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    if (isInWishlist(bookId)) {
      removeFromWishlist(bookId);
    } else {
      addToWishlist(bookId);
    }
  };

  const handleAddToCart = (bookId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    addToCart(bookId);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-64 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-5 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books</h1>
          {booksData && (
            <p className="text-gray-600 mt-1">
              {booksData.totalBooks} books found
              {currentSearch && ` for "${currentSearch}"`}
              {currentCategory && ` in ${currentCategory}`}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={`${currentSort}-${currentOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              updateSearchParams({ sort, order });
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="averageRating-desc">Highest Rated</option>
            <option value="title-asc">Title: A to Z</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Category Filter */}
            {categories && categories.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={!currentCategory}
                      onChange={() => updateSearchParams({ category: '' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories.map((category: string) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={currentCategory === category}
                        onChange={() => updateSearchParams({ category })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentMinPrice}
                    onChange={(e) => updateSearchParams({ minPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={currentMaxPrice}
                    onChange={(e) => updateSearchParams({ maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(currentCategory || currentMinPrice || currentMaxPrice) && (
              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                }}
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Books Grid/List */}
        <div className="flex-1">
          {booksData && booksData.books && booksData.books.length > 0 ? (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }>
                {booksData.books.map((book: any) => (
                  viewMode === 'grid' ? (
                    <div key={book._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                      <div className="relative">
                        <Link to={`/books/${book._id}`}>
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-full h-64 object-cover"
                          />
                        </Link>
                        <button
                          onClick={() => handleWishlistToggle(book._id)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                        >
                          <Heart 
                            className={`h-5 w-5 ${isInWishlist(book._id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
                          />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <Link to={`/books/${book._id}`}>
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                        <p className="text-xs text-gray-500 mb-3">{book.category}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-blue-600">₹{book.price}</span>
                          {book.averageRating > 0 && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{book.averageRating}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddToCart(book._id)}
                          disabled={book.stock === 0}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={book._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                      <div className="flex">
                        <Link to={`/books/${book._id}`} className="flex-shrink-0">
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-32 h-48 object-cover"
                          />
                        </Link>
                        
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-2">
                            <Link to={`/books/${book._id}`}>
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                {book.title}
                              </h3>
                            </Link>
                            <button
                              onClick={() => handleWishlistToggle(book._id)}
                              className="p-2 hover:bg-gray-100 rounded-full"
                            >
                              <Heart 
                                className={`h-5 w-5 ${isInWishlist(book._id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
                              />
                            </button>
                          </div>
                          
                          <p className="text-gray-600 mb-2">by {book.author}</p>
                          <p className="text-sm text-gray-500 mb-3">{book.category}</p>
                          <p className="text-gray-700 mb-4 line-clamp-2">{book.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl font-bold text-blue-600">₹{book.price}</span>
                              {book.averageRating > 0 && (
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-600 ml-1">{book.averageRating}</span>
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleAddToCart(book._id)}
                              disabled={book.stock === 0}
                              className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Pagination */}
              {booksData.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    {Array.from({ length: booksData.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => updateSearchParams({ page: page.toString() })}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No books found</div>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Books;