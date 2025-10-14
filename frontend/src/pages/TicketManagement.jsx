import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StaffLayout from '../components/StaffLayout';
import { ticketService } from '../services/ticketService';
import {
  Ticket,
  Search,
  Filter,
  Calendar,
  User,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Download,
  Star,
  TrendingUp,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  XCircle,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Tag,
  MoreVertical
} from 'lucide-react';

const TicketManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  
 // Fetch tickets from backend
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketService.getAllTickets();
      console.log('Fetched tickets:', response); // Debug log
      const ticketsData = response.tickets || [];
      setTickets(ticketsData);
      setFilteredTickets(ticketsData);
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error('Error fetching tickets:', err);
      // If there's an auth error or no tickets, use empty array
      setTickets([]);
      setFilteredTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let filtered = [...tickets];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status?.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(t => t.priority?.toLowerCase() === selectedPriority.toLowerCase());
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.customerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.customerId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        t._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.ticketNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort tickets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredTickets(filtered);
  }, [tickets, selectedStatus, selectedPriority, selectedCategory, searchTerm, sortBy]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colors = {
      'open': 'bg-red-100 text-red-700 border-red-200',
      'in progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'pending': 'bg-orange-100 text-orange-700 border-orange-200',
      'resolved': 'bg-green-100 text-green-700 border-green-200',
      'closed': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[statusLower] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    const icons = {
      'open': <AlertCircle className="w-4 h-4" />,
      'in progress': <Clock className="w-4 h-4" />,
      'in-progress': <Clock className="w-4 h-4" />,
      'pending': <RefreshCw className="w-4 h-4" />,
      'resolved': <CheckCircle className="w-4 h-4" />,
      'closed': <CheckCircle className="w-4 h-4" />
    };
    return icons[statusLower] || <AlertCircle className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    const colors = {
      'high': 'bg-red-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-green-500'
    };
    return colors[priorityLower] || 'bg-gray-500';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Delivery': <Truck className="w-4 h-4" />,
      'Quality': <Star className="w-4 h-4" />,
      'Payment': <CreditCard className="w-4 h-4" />,
      'Exchange': <RefreshCw className="w-4 h-4" />,
      'Refund': <XCircle className="w-4 h-4" />,
      'Damage': <AlertTriangle className="w-4 h-4" />
    };
    return icons[category] || <Package className="w-4 h-4" />;
  };

  const handleDeleteTicket = (ticket) => {
    setTicketToDelete(ticket);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await ticketService.deleteTicket(ticketToDelete._id);
      setTickets(tickets.filter(t => t._id !== ticketToDelete._id));
      setShowDeleteModal(false);
      setTicketToDelete(null);
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('Failed to delete ticket');
    }
  };

  const handleBulkAction = (action) => {
    if (selectedTickets.length === 0) return;

    switch (action) {
      case 'delete':
        setTickets(tickets.filter(t => !selectedTickets.includes(t._id)));
        setSelectedTickets([]);
        break;
      case 'resolve':
        setTickets(tickets.map(t =>
          selectedTickets.includes(t._id) ? { ...t, status: 'resolved' } : t
        ));
        setSelectedTickets([]);
        break;
      default:
        break;
    }
  };

  const toggleTicketSelection = (ticketId) => {
    if (selectedTickets.includes(ticketId)) {
      setSelectedTickets(selectedTickets.filter(id => id !== ticketId));
    } else {
      setSelectedTickets([...selectedTickets, ticketId]);
    }
  };

  // Parse ticket info from message
  const parseTicketInfo = (message) => {
    if (!message) return {};

    const orderNumberMatch = message.match(/Order Number:\s*([^\n]+)/i);
    const phoneMatch = message.match(/Phone:\s*([^\n]+)/i);
    const locationMatch = message.match(/Location:\s*([^\n]+)/i);
    const issueDateMatch = message.match(/Issue Date:\s*([^\n]+)/i);
    const orderValueMatch = message.match(/Order Value:\s*([^\n]+)/i);

    return {
      orderNumber: orderNumberMatch ? orderNumberMatch[1].trim() : null,
      customerPhone: phoneMatch ? phoneMatch[1].trim() : null,
      customerLocation: locationMatch ? locationMatch[1].trim() : null,
      issueDate: issueDateMatch ? issueDateMatch[1].trim() : null,
      orderValue: orderValueMatch ? orderValueMatch[1].trim() : null
    };
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open' || t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress' || t.status === 'in-progress').length,
    pending: tickets.filter(t => t.status === 'Pending' || t.status === 'pending').length,
    resolved: tickets.filter(t => t.status === 'Resolved' || t.status === 'resolved' || t.status === 'Closed' || t.status === 'closed').length,
    highPriority: tickets.filter(t => t.priority === 'High' || t.priority === 'high').length
  };

  return (
    <StaffLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Ticket Management System</h1>
              <p className="text-indigo-100 text-lg">Manage all customer support tickets efficiently</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-indigo-100">Total Tickets</div>
            </div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
                <div className="text-sm text-gray-600">Open</div>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-500" />
            </div>
          </div> */}

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.resolved}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.highPriority}</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</div>
                <div className="text-sm">Resolution Rate</div>
              </div>
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets by ID, customer, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="Delivery">Delivery</option>
                <option value="Quality">Quality</option>
                <option value="Payment">Payment</option>
                <option value="Exchange">Exchange</option>
                <option value="Refund">Refund</option>
                <option value="Damage">Damage</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
          

          {/* Bulk Actions */}
          {selectedTickets.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
              <span className="text-sm text-indigo-700 font-medium">
                {selectedTickets.length} tickets selected
              </span>
              <button
                onClick={() => handleBulkAction('resolve')}
                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedTickets([])}
                className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-red-800 font-semibold">Error loading tickets</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchTickets}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all'
                    ? 'Try adjusting your filters or search criteria'
                    : 'No support tickets available at the moment'}
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const ticketInfo = parseTicketInfo(ticket.message);
                return (
                  <div
                    key={ticket._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        {/* Checkbox and Ticket Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTickets.includes(ticket._id)}
                            onChange={() => toggleTicketSelection(ticket._id)}
                            className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />

                          <div className="flex-1">
                            {/* Ticket Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-lg font-semibold text-gray-900">
                                    #{ticket._id.slice(-6).toUpperCase()}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(ticket.status)}
                                      {ticket.status}
                                    </span>
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                                    <span className="text-sm text-gray-600">{ticket.priority} Priority</span>
                                  </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.subject}</h3>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/staff/tickets/${ticket._id}`)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTicket(ticket)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Ticket"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">Customer</p>
                                  <p className="font-medium text-gray-900">{ticket.customerId?.name || 'N/A'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">Email</p>
                                  <p className="font-medium text-gray-900">{ticket.customerId?.email || 'N/A'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">Order Number</p>
                                  <p className="font-medium text-gray-900">{ticketInfo.orderNumber || ticket.orderNumber || 'N/A'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Ticket Description */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                              <p className="text-gray-700 line-clamp-2">
                                {ticket.message?.split('\n').find(line => !line.includes(':')) || ticket.message || 'No description available'}
                              </p>
                            </div>

                            {/* Ticket Metadata */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(ticket.category)}
                                  <span className="text-sm text-gray-600">{ticket.category}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                  </span>
                                </div>

                                {ticket.replies && ticket.replies.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                                    </span>
                                  </div>
                                )}

                                {ticket.attachments && ticket.attachments.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {ticket.attachments.length} {ticket.attachments.length === 1 ? 'attachment' : 'attachments'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => navigate(`/staff/tickets/${ticket._id}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                              >
                                <span>View Details</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}


        {showDeleteModal && ticketToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Ticket?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete ticket <strong>{ticketToDelete._id}</strong>?
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Delete Ticket
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        )}
        </div>
        
      </div>
    </StaffLayout>
  );
};

export default TicketManagement;