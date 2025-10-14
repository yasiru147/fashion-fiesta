import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  TrendingUp,
  Sparkles,
  Tag,
  Zap
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const navigate = useNavigate();

  const categories = ['Men', 'Women', 'Kids', 'Accessories', 'Footwear', 'Bags', 'Jewelry', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products?status=active');

      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Price range filter
    if (priceRange !== 'all') {
      if (priceRange === 'under50') {
        filtered = filtered.filter(product => product.price < 50);
      } else if (priceRange === '50-100') {
        filtered = filtered.filter(product => product.price >= 50 && product.price <= 100);
      } else if (priceRange === '100-200') {
        filtered = filtered.filter(product => product.price > 100 && product.price <= 200);
      } else if (priceRange === 'over200') {
        filtered = filtered.filter(product => product.price > 200);
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated Header */}
        <div className="relative text-center mb-12">
          {/* Background decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <div className="relative">
            <div className="inline-flex items-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Our Fashion Collection
              </h1>
              <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
            </div>
            <p className="text-xl text-gray-700 font-medium mb-6">
              Discover the latest trends and timeless classics
            </p>

            {/* Stats badges */}
            <div className="flex items-center justify-center space-x-4 flex-wrap gap-2">
              <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border border-purple-200">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-bold text-gray-700">{products.length} Products</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border border-pink-200">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-bold text-gray-700">Premium Quality</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border border-purple-200">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-bold text-gray-700">Trending Styles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-gradient-to-r from-white via-purple-50/30 to-pink-50/30 rounded-3xl shadow-2xl p-8 mb-12 border border-purple-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Filter Products</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-purple-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
              />
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                <Package className="w-5 h-5 text-gray-400 transition-colors group-focus-within:text-purple-500" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                <Tag className="w-5 h-5 text-gray-400 transition-colors group-focus-within:text-purple-500" />
              </div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="under50">Under LKR 50</option>
                <option value="50-100">LKR 50 - LKR 100</option>
                <option value="100-200">LKR 100 - LKR 200</option>
                <option value="over200">Over LKR 200</option>
              </select>
            </div>
          </div>

          {/* Results Count with animation */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg">
              <Eye className="w-4 h-4" />
              <span>Showing {filteredProducts.length} of {products.length} products</span>
            </div>
          </div>
        </div>

        {/* Enhanced Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group relative transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                  {product.featured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center shadow-xl backdrop-blur-sm animate-pulse">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      Featured
                    </div>
                  )}
                  {product.discount > 0 && (
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xl backdrop-blur-sm ml-auto">
                      SAVE {product.discount}%
                    </div>
                  )}
                </div>

                {/* Stock badge */}
                {product.stock < 10 && product.stock > 0 && (
                  <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                    Only {product.stock} left!
                  </div>
                )}

                {/* Hover Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
                  <button className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500 bg-white text-purple-600 px-8 py-3 rounded-full font-bold flex items-center space-x-2 shadow-2xl hover:scale-105">
                    <Eye className="w-5 h-5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">{product.brand || 'Fashion Fiesta'}</p>
                </div>

                {/* Price with enhanced styling */}
                <div className="mb-4">
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      LKR {product.price}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through font-medium">
                        LKR {(product.price / (1 - product.discount / 100)).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.discount > 0 && (
                    <p className="text-xs text-green-600 font-bold">
                      You save LKR {((product.price / (1 - product.discount / 100)) - product.price).toFixed(2)}!
                    </p>
                  )}
                </div>

                {/* Category badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 px-4 py-2 rounded-full">
                    {product.category}
                  </span>

                  {/* Quick action icons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to wishlist functionality
                      }}
                      className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors group/heart"
                    >
                      <Heart className="w-4 h-4 text-pink-500 group-hover/heart:fill-pink-500 transition-all" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product._id);
                      }}
                      className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 text-purple-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative gradient border on hover */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-300 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Enhanced No Products Found */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-12 h-12 text-purple-400" />
                </div>
                <div className="absolute top-0 right-1/3 animate-bounce">
                  <Search className="w-6 h-6 text-pink-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any products matching your criteria. Try adjusting your filters or search query.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setPriceRange('all');
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
