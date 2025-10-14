import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Flag,
  Tag,
  User,
  Mail,
  Phone,
  ShoppingBag,
  FileText,
  Info
} from 'lucide-react';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);

  const statusColors = {
    'Open': 'bg-red-100 text-red-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Urgent': 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    'Open': AlertCircle,
    'In Progress': Clock,
    'Resolved': CheckCircle2,
    'Closed': CheckCircle2
  };

  const statusOptions = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const priorityOptions = ['All', 'Low', 'Medium', 'High', 'Urgent'];
  const categoryOptions = ['All', 'General', 'Order Issue', 'Payment', 'Return/Refund', 'Technical', 'Product Question'];

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    const count = [statusFilter, priorityFilter, categoryFilter].filter(f => f !== 'All').length;
    setActiveFiltersCount(count);
  }, [statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionMenu && !event.target.closest('.action-menu-container')) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionMenu]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getMyTickets();
      if (response.success) {
        setTickets(response.tickets);
        setFilteredTickets(response.tickets);
      }
    } catch (error) {
      setError('Failed to fetch tickets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }

    setFilteredTickets(filtered);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (ticket, e) => {
    e.preventDefault();
    e.stopPropagation();
    setTicketToDelete(ticket);
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;

    setDeleteLoading(true);
    try {
      await ticketService.deleteTicket(ticketToDelete._id);
      setTickets(prev => prev.filter(t => t._id !== ticketToDelete._id));
      setShowDeleteModal(false);
      setTicketToDelete(null);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      setError('Failed to delete ticket. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (ticketId, e) => {
    e.preventDefault();
    e.stopPropagation();
    // For now, redirect to view page - we can add edit functionality later
    window.location.href = `/tickets/${ticketId}`;
  };

  const handleViewClick = (ticketId, e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/tickets/${ticketId}`;
  };

  const toggleActionMenu = (ticketId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowActionMenu(showActionMenu === ticketId ? null : ticketId);
  };

  const parseTicketContent = (message) => {
    const sections = {};

    // Parse customer information
    const customerMatch = message.match(/CUSTOMER INFORMATION:(.*?)(?=ORDER INFORMATION|ADDITIONAL DETAILS|$)/s);
    if (customerMatch) {
      const customerInfo = customerMatch[1];
      const nameMatch = customerInfo.match(/Name:\s*([^\n]+)/);
      const emailMatch = customerInfo.match(/Email:\s*([^\n]+)/);
      const phoneMatch = customerInfo.match(/Phone:\s*([^\n]+)/);
      const contactMatch = customerInfo.match(/Preferred Contact:\s*([^\n]+)/);

      sections.customer = {
        name: nameMatch ? nameMatch[1].trim() : '',
        email: emailMatch ? emailMatch[1].trim() : '',
        phone: phoneMatch ? phoneMatch[1].trim().replace('Not provided', '') : '',
        preferredContact: contactMatch ? contactMatch[1].trim() : ''
      };
    }

    // Parse order information
    const orderMatch = message.match(/ORDER INFORMATION:(.*?)(?=ADDITIONAL DETAILS|CATEGORY|$)/s);
    if (orderMatch) {
      const orderInfo = orderMatch[1];
      const orderNumberMatch = orderInfo.match(/Order Number:\s*([^\n]+)/);
      const issueDateMatch = orderInfo.match(/Issue Date:\s*([^\n]+)/);

      sections.order = {
        orderNumber: orderNumberMatch ? orderNumberMatch[1].trim().replace('Not applicable', '') : '',
        issueDate: issueDateMatch ? issueDateMatch[1].trim().replace('Not specified', '') : ''
      };
    }

    // Parse additional details
    const detailsMatch = message.match(/ADDITIONAL DETAILS:(.*?)(?=CATEGORY|PRIORITY|$)/s);
    if (detailsMatch) {
      sections.details = detailsMatch[1].trim().replace('No additional details provided', '');
    }

    // Parse category and priority
    const categoryMatch = message.match(/CATEGORY:\s*([^\n]+)/);
    const priorityMatch = message.match(/PRIORITY:\s*([^\n]+)/);

    sections.category = categoryMatch ? categoryMatch[1].trim() : '';
    sections.priority = priorityMatch ? priorityMatch[1].trim() : '';

    return sections;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleDownloadPDF = async (ticketId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await ticketService.downloadTicketPDF(ticketId);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl shadow-lg mb-6">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Support Tickets</h1>
        <p className="text-xl text-gray-600 mb-6">
          Track and manage your support requests
        </p>
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{filteredTickets.length}</div>
            <div className="text-sm text-gray-500">Ticket{filteredTickets.length !== 1 ? 's' : ''} Found</div>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <Link
            to="/create-ticket"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:to-accent-700 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Ticket
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets by subject, message, or category..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-300 ${
                  showFilters
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="text-gray-500">
            <MessageSquare className="mx-auto h-16 w-16 mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first support ticket to get help from our expert team.</p>
            <Link
              to="/create-ticket"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:to-accent-700 shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Ticket
            </Link>
          </div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="text-gray-500">
            <Search className="mx-auto h-16 w-16 mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Try adjusting your search criteria or filters to find the tickets you're looking for.</p>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:to-accent-700 shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              <X className="w-5 h-5 mr-2" />
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map((ticket) => {
            const StatusIcon = statusIcons[ticket.status];
            const hasNewReplies = ticket.replies && ticket.replies.length > 0;
            const lastReply = hasNewReplies ? ticket.replies[ticket.replies.length - 1] : null;

            return (
              <div
                key={ticket._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 relative overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`h-2 w-full ${
                  ticket.status === 'Open' ? 'bg-red-500' :
                  ticket.status === 'In Progress' ? 'bg-yellow-500' :
                  ticket.status === 'Resolved' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}></div>

                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      {/* Ticket Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                            {ticket.subject}
                          </h3>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]} shadow-sm`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {ticket.status}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]} shadow-sm`}>
                              <Flag className="w-3 h-3 mr-1" />
                              {ticket.priority}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                              <Tag className="w-3 h-3 mr-1" />
                              {ticket.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Content Preview */}
                      <div className="mb-6">
                        {(() => {
                          const parsedContent = parseTicketContent(ticket.message);

                          return (
                            <div className="space-y-4">
                              {/* Customer Information */}
                              {parsedContent.customer && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {parsedContent.customer.name && (
                                    <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                      <User className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                                      <div>
                                        <div className="text-xs font-medium text-blue-800">Customer</div>
                                        <div className="text-sm text-gray-900">{parsedContent.customer.name}</div>
                                      </div>
                                    </div>
                                  )}
                                  {parsedContent.customer.email && (
                                    <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
                                      <Mail className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
                                      <div>
                                        <div className="text-xs font-medium text-green-800">Email</div>
                                        <div className="text-sm text-gray-900 truncate">{parsedContent.customer.email}</div>
                                      </div>
                                    </div>
                                  )}
                                  {parsedContent.customer.phone && (
                                    <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                                      <Phone className="w-4 h-4 text-purple-600 mr-3 flex-shrink-0" />
                                      <div>
                                        <div className="text-xs font-medium text-purple-800">Phone</div>
                                        <div className="text-sm text-gray-900">{parsedContent.customer.phone}</div>
                                      </div>
                                    </div>
                                  )}
                                  {parsedContent.order && parsedContent.order.orderNumber && (
                                    <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                                      <ShoppingBag className="w-4 h-4 text-orange-600 mr-3 flex-shrink-0" />
                                      <div>
                                        <div className="text-xs font-medium text-orange-800">Order #</div>
                                        <div className="text-sm text-gray-900 font-mono">{parsedContent.order.orderNumber}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Additional Details */}
                              {parsedContent.details && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-start">
                                    <FileText className="w-4 h-4 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="text-xs font-medium text-gray-700 mb-1">Additional Details</div>
                                      <p className="text-sm text-gray-900 leading-relaxed">
                                        {parsedContent.details.length > 100
                                          ? `${parsedContent.details.substring(0, 100)}...`
                                          : parsedContent.details}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Fallback for unstructured content */}
                              {!parsedContent.customer && !parsedContent.details && (
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="flex items-start">
                                    <Info className="w-4 h-4 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="text-xs font-medium text-gray-700 mb-1">Ticket Description</div>
                                      <p className="text-sm text-gray-900 leading-relaxed">
                                        {ticket.message.length > 150
                                          ? `${ticket.message.substring(0, 150)}...`
                                          : ticket.message}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Ticket Metadata */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Created {formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{ticket.replies ? ticket.replies.length : 0} {ticket.replies?.length === 1 ? 'reply' : 'replies'}</span>
                        </div>
                      </div>

                      {lastReply && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">
                                {lastReply.userId.name}
                                {lastReply.isStaff && (
                                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Staff
                                  </span>
                                )}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                              {formatDate(lastReply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                            {lastReply.message.length > 100
                              ? `${lastReply.message.substring(0, 100)}...`
                              : lastReply.message}
                          </p>
                        </div>
                      )}
                    </Link>

                    {/* Action Buttons */}
                    <div className="relative ml-6 action-menu-container">
                      <button
                        onClick={(e) => toggleActionMenu(ticket._id, e)}
                        className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <MoreVertical className="w-6 h-6" />
                      </button>

                      {/* Dropdown Menu */}
                      {showActionMenu === ticket._id && (
                        <div className="absolute right-0 top-10 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                          <button
                            onClick={(e) => handleViewClick(ticket._id, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-3 text-blue-500" />
                            View Details
                          </button>

                          {ticket.status !== 'Closed' && (
                            <button
                              onClick={(e) => handleEditClick(ticket._id, e)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit3 className="w-4 h-4 mr-3 text-green-500" />
                              Edit Ticket
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDownloadPDF(ticket._id, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-3 text-purple-500" />
                            Download PDF
                          </button>

                          <div className="border-t border-gray-100 my-1"></div>

                          <button
                            onClick={(e) => handleDeleteClick(ticket, e)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Delete Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Last Activity Info */}
                  {ticket.status !== 'Closed' && (
                    <div className="mt-4 text-xs text-right text-gray-500">
                      Last activity: {formatDate(ticket.lastActivity)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Ticket</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this ticket?
              </p>
              {ticketToDelete && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900 truncate">
                    {ticketToDelete.subject}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Created {formatDate(ticketToDelete.createdAt)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTicketToDelete(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default MyTickets;