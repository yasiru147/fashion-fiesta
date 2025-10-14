import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  User,
  MessageCircle,
  TrendingUp,
  Star,
  ChevronRight,
  Eye,
  Edit,
  Reply
} from 'lucide-react';

const SupportTicketManagement = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  // Mock tickets data
  const mockTickets = [
    {
      id: 'TKT-2024-001',
      customer: 'Ravindu Pasanjith',
      email: 'ravindupasanjith1542@gmail.com',
      subject: 'Issue with Order Delivery',
      message: 'My order has not been delivered yet. It has been 5 days since I placed the order.',
      status: 'open',
      priority: 'high',
      category: 'Delivery',
      createdAt: '2024-01-15',
      lastUpdate: '2024-01-15',
      assignedTo: null,
      replies: []
    },
    {
      id: 'TKT-2024-002',
      customer: 'Ravindu Pasanjith',
      email: 'ravindupasanjith1542@gmail.com',
      subject: 'Product Quality Issue',
      message: 'The product quality is not as expected. The fabric seems different from the photos.',
      status: 'in-progress',
      priority: 'medium',
      category: 'Quality',
      createdAt: '2024-01-14',
      lastUpdate: '2024-01-16',
      assignedTo: 'Support Staff',
      replies: [
        {
          author: 'Support Staff',
          message: 'We apologize for the inconvenience. A replacement has been arranged.',
          date: '2024-01-16'
        }
      ]
    },
    {
      id: 'TKT-2024-003',
      customer: 'John Doe',
      email: 'john@example.com',
      subject: 'Size Exchange Request',
      message: 'I need to exchange the size of my order. Ordered M but need L.',
      status: 'resolved',
      priority: 'low',
      category: 'Exchange',
      createdAt: '2024-01-13',
      lastUpdate: '2024-01-14',
      assignedTo: 'Support Staff',
      replies: [
        {
          author: 'Support Staff',
          message: 'Exchange process initiated. Please return the item.',
          date: '2024-01-14'
        }
      ]
    },
    {
      id: 'TKT-2024-004',
      customer: 'Sarah Smith',
      email: 'sarah@example.com',
      subject: 'Payment Issue',
      message: 'Payment was deducted but order not confirmed.',
      status: 'open',
      priority: 'high',
      category: 'Payment',
      createdAt: '2024-01-16',
      lastUpdate: '2024-01-16',
      assignedTo: null,
      replies: []
    },
    {
      id: 'TKT-2024-005',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      subject: 'Refund Request',
      message: 'I want to return the product and get a refund.',
      status: 'in-progress',
      priority: 'medium',
      category: 'Refund',
      createdAt: '2024-01-15',
      lastUpdate: '2024-01-16',
      assignedTo: 'Admin User',
      replies: []
    }
  ];

  useEffect(() => {
    setTickets(mockTickets);
    setFilteredTickets(mockTickets);
  }, []);

  useEffect(() => {
    let filtered = tickets;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.status === selectedFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }, [selectedFilter, searchTerm, tickets]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAssignToMe = (ticketId) => {
    setTickets(tickets.map(t =>
      t.id === ticketId
        ? { ...t, assignedTo: user.name, status: 'in-progress' }
        : t
    ));
  };

  const handleReply = (ticket) => {
    setSelectedTicket(ticket);
    setShowReplyModal(true);
  };

  const submitReply = () => {
    if (replyMessage.trim()) {
      const updatedTickets = tickets.map(t => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            replies: [...t.replies, {
              author: user.name,
              message: replyMessage,
              date: new Date().toISOString().split('T')[0]
            }],
            lastUpdate: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      });
      setTickets(updatedTickets);
      setReplyMessage('');
      setShowReplyModal(false);
      setSelectedTicket(null);
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    myTickets: tickets.filter(t => t.assignedTo === user.name).length
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Ticket Management</h1>
            <p className="text-indigo-100 text-lg">Manage and resolve customer support tickets</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.myTickets}</div>
            <div className="text-indigo-100">Assigned to You</div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-gray-600">Total Tickets</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
              <div className="text-gray-600">Open</div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="text-gray-600">In Progress</div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.resolved}</div>
              <div className="text-gray-600">Resolved</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setSelectedFilter('open')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedFilter === 'open'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Open ({stats.open})
            </button>
            <button
              onClick={() => setSelectedFilter('in-progress')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedFilter === 'in-progress'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setSelectedFilter('resolved')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedFilter === 'resolved'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Resolved ({stats.resolved})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-gray-900">{ticket.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                    <span className="text-sm text-gray-600">{ticket.priority} priority</span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{ticket.subject}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{ticket.message}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{ticket.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{ticket.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{ticket.replies.length} replies</span>
                    </div>
                    {ticket.assignedTo && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Assigned to: {ticket.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!ticket.assignedTo && ticket.status === 'open' && (
                    <button
                      onClick={() => handleAssignToMe(ticket.id)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                    >
                      Assign to Me
                    </button>
                  )}
                  <button
                    onClick={() => handleReply(ticket)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    <Reply className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Reply to Ticket {selectedTicket.id}</h3>
            <div className="mb-4">
              <p className="text-gray-600 font-medium">{selectedTicket.subject}</p>
              <p className="text-sm text-gray-500">Customer: {selectedTicket.customer}</p>
            </div>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="6"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedTicket(null);
                  setReplyMessage('');
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReply}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketManagement;