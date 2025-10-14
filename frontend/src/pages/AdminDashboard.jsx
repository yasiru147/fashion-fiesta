import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import {
  Users,
  Ticket,
  TrendingUp,
  Activity,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Shield,
  Star,
  Zap,
  ShoppingBag
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTickets: 0,
    activeStaff: 0,
    systemUptime: '99.9%',
    newUsersToday: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '0h'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      isIncrease: true,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Tickets',
      value: stats.totalTickets,
      change: '+8%',
      isIncrease: true,
      icon: Ticket,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Staff',
      value: stats.activeStaff,
      change: '+2',
      isIncrease: true,
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'System Uptime',
      value: stats.systemUptime,
      change: 'Excellent',
      isIncrease: true,
      icon: Activity,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    }
  ];

  const ticketStats = [
    { label: 'Open Tickets', value: stats.openTickets, color: 'bg-yellow-500', icon: Clock },
    { label: 'Resolved', value: stats.resolvedTickets, color: 'bg-green-500', icon: CheckCircle },
    { label: 'New Today', value: stats.newUsersToday, color: 'bg-blue-500', icon: Zap }
  ];

  // Fetch dashboard stats from backend
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const data = response.data.stats;
          setStats({
            totalUsers: data.totalUsers,
            totalTickets: data.totalTickets,
            activeStaff: data.activeStaff,
            systemUptime: '99.9%',
            newUsersToday: data.newUsersToday,
            openTickets: data.openTickets,
            resolvedTickets: data.resolvedTickets,
            avgResponseTime: data.avgResponseTime
          });

          // Map activity data with icon components
          const activityWithIcons = (data.recentActivity || []).map((activity, index) => {
            const iconMap = {
              UserCheck: UserCheck,
              CheckCircle: CheckCircle,
              AlertCircle: AlertCircle,
              Shield: Shield,
              Ticket: Ticket,
              ShoppingBag: ShoppingBag
            };

            return {
              id: index + 1,
              type: activity.type,
              message: activity.message,
              time: activity.time,
              icon: iconMap[activity.icon] || Activity,
              color: activity.color
            };
          });

          setRecentActivity(activityWithIcons);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome Back, Administrator!</h2>
              <p className="text-purple-100">Here's what's happening with Fashion Fiesta today.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Star className="w-10 h-10 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-semibold ${stat.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.isIncrease ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ticket Stats Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Ticket Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ticketStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-600" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`p-2 rounded-lg bg-white ${activity.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-left">
            <Users className="w-8 h-8 mb-3" />
            <h4 className="text-lg font-bold mb-1">Manage Users</h4>
            <p className="text-sm text-blue-100">View and manage all users</p>
          </button>

          <button className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-left">
            <Ticket className="w-8 h-8 mb-3" />
            <h4 className="text-lg font-bold mb-1">View Tickets</h4>
            <p className="text-sm text-purple-100">Manage support tickets</p>
          </button>

          <button className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-left">
            <BarChart3 className="w-8 h-8 mb-3" />
            <h4 className="text-lg font-bold mb-1">View Reports</h4>
            <p className="text-sm text-green-100">Analytics and insights</p>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
