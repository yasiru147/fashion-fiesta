import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, User, Ticket, Home, Sparkles, Crown, ShoppingBag, Package, ShoppingCart, PackageCheck } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'support';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Beautiful Header */}
      <nav className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-8 right-20 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-75"></div>
          <div className="absolute top-12 left-32 w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-6 right-40 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-14 left-64 w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:rotate-12 group-hover:shadow-xl">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent drop-shadow-lg">
                    Fashion Fiesta
                  </span>
                  <div className="text-sm text-yellow-200 font-medium tracking-wide">
                    Premium Style Support
                  </div>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                <Link
                  to="/"
                  className={`group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    location.pathname === '/'
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Home
                  {location.pathname === '/' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                  )}
                </Link>

                <Link
                  to="/products"
                  className={`group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    location.pathname === '/products' || location.pathname.startsWith('/products/')
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Package className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Products
                  {(location.pathname === '/products' || location.pathname.startsWith('/products/')) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                  )}
                </Link>

                {user && (
                  <Link
                    to="/my-orders"
                    className={`group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      location.pathname === '/my-orders'
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    My Orders
                    {location.pathname === '/my-orders' && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    )}
                  </Link>
                )}

                {user && (
                  <Link
                    to="/my-tickets"
                    className={`group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      location.pathname === '/my-tickets'
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Ticket className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    My Tickets
                    {location.pathname === '/my-tickets' && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    )}
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/tickets"
                    className={`group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      location.pathname === '/admin/tickets'
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    All Tickets
                    {location.pathname === '/admin/tickets' && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    )}
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/staff/dashboard"
                    className={`group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      location.pathname === '/staff/dashboard'
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Crown className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    Staff Dashboard
                    {location.pathname === '/staff/dashboard' && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    )}
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/ticket-management"
                    className={`group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                      location.pathname === '/ticket-management'
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Ticket className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    Ticket Management
                    {location.pathname === '/ticket-management' && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
                    )}
                  </Link>
                )}
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Cart Icon */}
                  <Link
                    to="/cart"
                    className="relative group"
                  >
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-white/20 hover:bg-white/20 transition-all">
                      <ShoppingCart className="w-5 h-5 text-white" />
                      {cartItemCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                          {cartItemCount}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* User Profile */}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-white">
                      <div className="text-sm font-semibold">{user.name}</div>
                      {isAdmin && (
                        <div className="flex items-center mt-1">
                          <Crown className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-yellow-200 font-medium capitalize">
                            {user.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="group flex items-center px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <LogOut className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-white/90 hover:text-white font-medium rounded-xl transition-all duration-300 hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="group px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                      Register
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom gradient border */}
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"></div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;