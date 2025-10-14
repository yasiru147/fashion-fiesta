import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  UserPlus,
  Shield,
  Crown,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Error deleting user');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-purple-100 text-purple-700', icon: Crown, label: 'Admin' },
      support: { color: 'bg-blue-100 text-blue-700', icon: Shield, label: 'Support' },
      customer: { color: 'bg-green-100 text-green-700', icon: UserCheck, label: 'Customer' }
    };

    const badge = badges[role] || badges.customer;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    support: users.filter(u => u.role === 'support').length,
    customers: users.filter(u => u.role === 'customer').length
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users in the system</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Admins</p>
                <p className="text-3xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Support Staff</p>
                <p className="text-3xl font-bold text-blue-600">{stats.support}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customers</p>
                <p className="text-3xl font-bold text-green-600">{stats.customers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="support">Support</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete User</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagement;
