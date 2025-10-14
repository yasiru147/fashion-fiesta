import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Ticket,
  Users,
  Settings,
  Home,
  Crown,
  Sparkles,
  LogOut,
  User,
  Award,
  TrendingUp,
  Shield,
  Bell,
  FileText
} from 'lucide-react';

const StaffSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    // {
    //   id: 'dashboard',
    //   label: 'Dashboard',
    //   icon: Home,
    //   description: 'Overview & Stats',
    //   path: '/staff/dashboard'
    // },
    {
      id: 'ticket-management',
      label: 'All Tickets',
      icon: FileText,
      description: 'Full Ticket Management',
      path: '/ticket-management'
    }
  ];

  const handleNavigation = (item) => {
    console.log('Navigating to:', item.path);
    navigate(item.path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 via-gray-900 to-slate-900 shadow-2xl z-40 overflow-y-auto">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-20 right-12 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100 opacity-40"></div>
        <div className="absolute top-32 left-16 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse delay-200 opacity-35"></div>
        <div className="absolute top-48 right-8 w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-300 opacity-45"></div>
        <div className="absolute top-64 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-500 opacity-30"></div>
      </div>

      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
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
              <h2 className="text-lg font-bold text-white">Staff Panel</h2>
              <p className="text-xs text-gray-400">Fashion Fiesta</p>
            </div>
          </div>

          {/* User Profile */}
          <div className="mt-4 p-3 bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-xl border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <Shield className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                <div className="flex items-center mt-1">
                  <Crown className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-yellow-200 font-medium capitalize">
                    {user?.role} Staff
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-500/20 rounded-lg p-2">
                <div className="text-xs font-bold text-blue-400">23</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
              <div className="bg-green-500/20 rounded-lg p-2">
                <div className="text-xs font-bold text-green-400">156</div>
                <div className="text-xs text-gray-400">Resolved</div>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-2">
                <div className="text-xs font-bold text-purple-400">98%</div>
                <div className="text-xs text-gray-400">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
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
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-r-full" />
                )}

                <div className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-300 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/50 group-hover:text-white'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${
                    isActive ? 'text-indigo-100' : 'text-gray-500 group-hover:text-gray-400'
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

        {/* Performance Badge */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl p-3 border border-emerald-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Top Performer</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">This Month</span>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-4 border-t border-gray-700/50">
          <button className="w-full flex items-center justify-between p-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl transition-all duration-300 border border-orange-500/20">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">3</span>
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center px-3 py-3 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3 bg-gray-700/50 text-gray-400 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all duration-300">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffSidebar;