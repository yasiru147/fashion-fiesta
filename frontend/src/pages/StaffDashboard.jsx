import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StaffLayout from '../components/StaffLayout';
import SupportTicketManagement from './SupportTicketManagement';
import { dashboardService } from '../services/dashboardService';
import {
  Ticket,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  MessageCircle,
  Award,
  Target
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0,
    myTickets: 0,
    resolvedToday: 0,
    avgResponseTime: '0 hrs',
    satisfactionRate: '0%',
    monthlyResolved: 0,
    highPriorityTickets: 0,
    recentTickets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardService.getDashboardStats();
        if (response.success) {
          setStats(response.stats);
        } else {
          setError('Failed to load dashboard statistics');
        }
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError('Error loading dashboard data');
        // Set fallback data on error
        setStats({
          totalTickets: 0,
          openTickets: 0,
          inProgressTickets: 0,
          resolvedTickets: 0,
          pendingTickets: 0,
          myTickets: 0,
          resolvedToday: 0,
          avgResponseTime: '0 hrs',
          satisfactionRate: '0%',
          monthlyResolved: 0,
          highPriorityTickets: 0,
          recentTickets: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300"
           style={{
             background: color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                        color === 'green' ? 'linear-gradient(135deg, #10b981, #059669)' :
                        color === 'orange' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                        color === 'purple' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
                        'linear-gradient(135deg, #ef4444, #dc2626)'
           }} />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
              color === 'blue' ? 'bg-blue-100 text-blue-600' :
              color === 'green' ? 'bg-green-100 text-green-600' :
              color === 'orange' ? 'bg-orange-100 text-orange-600' :
              color === 'purple' ? 'bg-purple-100 text-purple-600' :
              'bg-red-100 text-red-600'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-gray-600 font-medium">{title}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-red-800 font-semibold mb-2">Error loading dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-pink-600/90" />
        <div className="absolute top-4 right-8 opacity-20">
          <Award className="w-32 h-32" />
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-indigo-100 text-lg">You're doing an amazing job supporting our customers</p>
          <div className="mt-6 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Top Performer</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="font-semibold">{stats.monthlyResolved} resolved this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Ticket}
          title="Total Tickets"
          value={stats.totalTickets.toLocaleString()}
          subtitle="All time"
          color="blue"
          trend={12}
        />
        <StatCard
          icon={Clock}
          title="Open Tickets"
          value={stats.openTickets}
          subtitle="Needs attention"
          color="orange"
          trend={-5}
        />
        <StatCard
          icon={CheckCircle}
          title="Resolved Today"
          value={stats.resolvedToday}
          subtitle="Great work!"
          color="green"
          trend={8}
        />
        <StatCard
          icon={AlertTriangle}
          title="My Active Tickets"
          value={stats.myTickets}
          subtitle="Assigned to you"
          color="purple"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Performance Overview</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <span>This Month</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.satisfactionRate}</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.monthlyResolved}</div>
              <div className="text-sm text-gray-600">Resolved This Month</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 group">
              <div className="flex items-center space-x-3">
                <Ticket className="w-5 h-5" />
                <span className="font-medium">View My Tickets</span>
              </div>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">{stats.myTickets}</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 group">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span className="font-medium">Customer Analytics</span>
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 group">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Priority Tickets</span>
              </div>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">{stats.highPriorityTickets}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tickets':
        return <SupportTicketManagement />;
      case 'analytics':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        );
      case 'customers':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Management</h2>
            <p className="text-gray-600">Customer management interface coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Staff Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <StaffLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;