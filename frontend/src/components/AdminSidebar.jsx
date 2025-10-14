import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  Settings,
  Crown,
  Sparkles,
  LogOut,
  User,
  Award,
  TrendingUp,
  Shield,
  FileText,
  UserCog,
  BarChart3,
  Database,
  Package,
  ShoppingBag
} from 'lucide-react';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTickets: 0,
    activeStaff: 0
  });

  useEffect(() => {
    const fetchSidebarStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/dashboard/sidebar-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
      }
    };

    fetchSidebarStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics',
      path: '/admin/dashboard'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage All Users',
      path: '/admin/users'
    },
    {
      id: 'products',
      label: 'Product Management',
      icon: Package,
      description: 'Manage Products',
      path: '/admin/products'
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ShoppingBag,
      description: 'Manage All Orders',
      path: '/admin/orders'
    }
  ];

  const handleNavigation = (item) => {
    console.log('Navigating to:', item.path);
    navigate(item.path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-purple-900 via-pink-900 to-purple-900 shadow-2xl z-40 overflow-y-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-8 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-20 right-12 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100 opacity-40"></div>
        <div className="absolute top-32 left-16 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse delay-200 opacity-35"></div>
        <div className="absolute top-48 right-8 w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-300 opacity-45"></div>
        <div className="absolute top-64 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-500 opacity-30"></div>
      </div>

      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-pink-700/50">
          <div className="flex items-center group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:rotate-12">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-bold text-white">Admin Panel</h2>
              <p className="text-xs text-pink-200">Fashion Fiesta</p>
            </div>
          </div>

          {/* User Profile */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-800/50 to-pink-800/30 rounded-xl border border-pink-600/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-purple-900 flex items-center justify-center">
                  <Shield className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                <div className="flex items-center mt-1">
                  <Crown className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-yellow-200 font-medium">
                    Administrator
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-purple-500/20 rounded-lg p-2">
                <div className="text-xs font-bold text-purple-300">{stats.totalUsers}</div>
                <div className="text-xs text-gray-300">Users</div>
              </div>
              <div className="bg-pink-500/20 rounded-lg p-2">
                <div className="text-xs font-bold text-pink-300">{stats.totalTickets}</div>
                <div className="text-xs text-gray-300">Tickets</div>
              </div>
              <div className="bg-yellow-500/20 rounded-lg p-2">
                <div className="text-xs font-bold text-yellow-300">{stats.activeStaff}</div>
                <div className="text-xs text-gray-300">Staff</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-pink-200 uppercase tracking-wider mb-4 px-2">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`group relative w-full flex items-center px-3 py-3 text-left rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-pink-100 hover:text-white hover:bg-purple-800/50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-r-full" />
                )}

                <div className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-300 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-700/50 text-pink-200 group-hover:bg-purple-600/50 group-hover:text-white'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    isActive ? 'text-white' : 'text-pink-100 group-hover:text-white'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${
                    isActive ? 'text-purple-100' : 'text-pink-300 group-hover:text-pink-200'
                  }`}>
                    {item.description}
                  </div>
                </div>

                {isActive && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Admin Badge */}
        <div className="p-4 border-t border-pink-700/50">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 border border-yellow-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">System Admin</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-200">Full Access</span>
              <div className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 font-medium">All Systems</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-pink-700/50">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center px-3 py-3 text-pink-100 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3 bg-purple-700/50 text-pink-200 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all duration-300">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
