import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import StaffLayout from '../components/StaffLayout';
import {
  ArrowLeft,
  Send,
  Download,
  Clock,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Flag,
  Mail,
  Phone,
  ShoppingBag,
  FileText,
  Info,
  Shield,
  UserCheck,
  MessageCircle,
  Settings,
  Edit3,
  Save,
  X,
  Paperclip,
  Eye,
  ExternalLink,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

const StaffTicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject: '',
    category: '',
    priority: '',
    customerName: '',
    customerEmail: '',
    phoneNumber: '',
    orderNumber: '',
    issueDate: '',
    additionalDetails: '',
    preferredContact: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyMessage, setEditReplyMessage] = useState('');
  const [replyActions, setReplyActions] = useState({});

  const isAdmin = user?.role === 'admin' || user?.role === 'support';

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

  const categories = [
    'General', 'Order Issue', 'Payment', 'Return/Refund', 'Technical', 'Product Question'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTicketById(id);
      if (response.success) {
        setTicket(response.ticket);
        setNewStatus(response.ticket.status);

        // Parse existing ticket data for edit form
        const parsedContent = parseTicketContent(response.ticket.message);
        setEditFormData({
          subject: response.ticket.subject,
          category: response.ticket.category,
          priority: response.ticket.priority,
          customerName: parsedContent.customer?.name || response.ticket.customerId?.name || '',
          customerEmail: parsedContent.customer?.email || response.ticket.customerId?.email || '',
          phoneNumber: parsedContent.customer?.phone || '',
          orderNumber: parsedContent.order?.orderNumber || '',
          issueDate: parsedContent.order?.issueDate || '',
          additionalDetails: parsedContent.details || response.ticket.message,
          preferredContact: parsedContent.customer?.preferredContact || 'email'
        });

      }
    } catch (error) {
      setError('Failed to fetch ticket details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setSendingReply(true);
      let response;
      if(replyMessage.trim().length <=500 ) {
        response = await ticketService.addReply(id, replyMessage);
      }
      if (response.success) {
        setReplyMessage('');
        await fetchTicket();
      }
    } catch (error) {
      setError('Failed to send reply');
      console.error(error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === ticket.status) return;

    try {
      const response = await ticketService.updateTicketStatus(id, newStatus);
      if (response.success) {
        await fetchTicket();
      }
    } catch (error) {
      setError('Failed to update ticket status');
      console.error(error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await ticketService.downloadTicketPDF(id);
    } catch (error) {
      setError('Failed to download PDF');
      console.error(error);
    }
  };

  const handleEditReply = (replyId, currentMessage) => {
    setEditingReply(replyId);
    setEditReplyMessage(currentMessage);
  };

  const handleSaveReply = async (replyId) => {
    try {
      const response = await ticketService.editReply(id, replyId, editReplyMessage);
      if (response.success) {
        setEditingReply(null);
        setEditReplyMessage('');
        await fetchTicket();
        setSuccessMessage('Reply updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setError('Failed to update reply');
      console.error(error);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      const response = await ticketService.deleteReply(id, replyId);
      if (response.success) {
        await fetchTicket();
        setSuccessMessage('Reply deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setError('Failed to delete reply');
      console.error(error);
    }
  };

  const handleCancelEditReply = () => {
    setEditingReply(null);
    setEditReplyMessage('');
  };

  const toggleReplyActions = (replyId) => {
    setReplyActions(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(''); // Clear any existing errors
    setSuccessMessage(''); // Clear any existing success messages
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    // Validate required fields
    if (!editFormData.subject.trim()) {
      setError('Subject is required');
      setSaveLoading(false);
      return;
    }

    if (!editFormData.customerName.trim()) {
      setError('Customer name is required');
      setSaveLoading(false);
      return;
    }

    if (!editFormData.customerEmail.trim()) {
      setError('Customer email is required');
      setSaveLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.customerEmail)) {
      setError('Please enter a valid email address');
      setSaveLoading(false);
      return;
    }

    try {
      // Format the updated message
      const updatedMessage = `
CUSTOMER INFORMATION:
Name: ${editFormData.customerName.trim()}
Email: ${editFormData.customerEmail.trim()}
Phone: ${editFormData.phoneNumber.trim() || 'Not provided'}
Preferred Contact: ${editFormData.preferredContact}

ORDER INFORMATION:
Order Number: ${editFormData.orderNumber.trim() || 'Not applicable'}
Issue Date: ${editFormData.issueDate || 'Not specified'}

ADDITIONAL DETAILS:
${editFormData.additionalDetails.trim() || 'No additional details provided'}

CATEGORY: ${editFormData.category}
PRIORITY: ${editFormData.priority}
      `.trim();

      const updateData = {
        subject: editFormData.subject.trim(),
        message: updatedMessage,
        category: editFormData.category,
        priority: editFormData.priority
      };

      const response = await ticketService.updateTicket(id, updateData);

      if (response.success) {
        setIsEditing(false);
        setSuccessMessage('Ticket updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000); // Clear success message after 5 seconds
        await fetchTicket(); // Refresh ticket data
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update ticket. Please try again.');
      }
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
    // Reset form data to original values
    fetchTicket();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </StaffLayout>
    );
  }

  if (!ticket) {
    return (
      <StaffLayout>
        <div className="text-center py-12">
          <div className="text-gray-500">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium">Ticket not found</h3>
            <p className="mt-1">The ticket you're looking for doesn't exist.</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-32 right-16 w-96 h-96 bg-gradient-to-r from-pink-400/15 to-orange-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-green-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/ticket-management')}
              className="group flex items-center text-gray-600 hover:text-gray-900 transition-all duration-300 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 hover:border-gray-300/50"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back to Tickets</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="group flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-white/20"
            >
              <Download className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">Download PDF</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl shadow-sm">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-xl shadow-sm">
              <div className="flex">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Header Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden hover:shadow-3xl transition-all duration-500">
            {/* Status Bar with Animation */}
            <div className={`h-3 w-full relative overflow-hidden ${
              ticket.status === 'Open' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              ticket.status === 'In Progress' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              ticket.status === 'Resolved' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              'bg-gradient-to-r from-gray-500 to-gray-600'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>

            {/* Header Content */}
            <div className="p-10">
              <div className="text-center mb-10">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl mb-6 group">
                  <MessageSquare className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -inset-1 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">{ticket.subject}</h1>
                <div className="flex items-center justify-center space-x-6">
                  <span className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg border border-white/20 backdrop-blur-sm ${statusColors[ticket.status]} hover:scale-105 transition-transform duration-200`}>
                    <Clock className="w-4 h-4 mr-2" />
                    {ticket.status}
                  </span>
                  <span className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg border border-white/20 backdrop-blur-sm ${priorityColors[ticket.priority]} hover:scale-105 transition-transform duration-200`}>
                    <Flag className="w-4 h-4 mr-2" />
                    {ticket.priority}
                  </span>
                  <span className="inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 shadow-lg border border-indigo-200/50 backdrop-blur-sm hover:scale-105 transition-transform duration-200">
                    <Tag className="w-4 h-4 mr-2" />
                    {ticket.category}
                  </span>
                </div>
              </div>

              {/* Ticket Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group flex items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-800 mb-1">Customer</div>
                    <div className="text-lg font-bold text-gray-900">{ticket.customerId.name}</div>
                  </div>
                </div>
                <div className="group flex items-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mr-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-800 mb-1">Created</div>
                    <div className="text-lg font-bold text-gray-900">{formatDate(ticket.createdAt)}</div>
                  </div>
                </div>
                <div className="group flex items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mr-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-purple-800 mb-1">Replies</div>
                    <div className="text-lg font-bold text-gray-900">{ticket.replies ? ticket.replies.length : 0} replies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 p-8 hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Controls</h3>
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <label htmlFor="status" className="text-sm font-semibold text-gray-800">
                    Update Status:
                  </label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border-2 border-gray-300 rounded-2xl px-6 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-lg transition-all duration-200 hover:border-indigo-400"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                {newStatus !== ticket.status && (
                  <button
                    onClick={handleStatusUpdate}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white rounded-2xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 shadow-xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  >
                    Update Status
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ticket Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Original Request
                    </h3>
                    <p className="text-sm text-gray-600">
                      by {ticket.customerId.name} • {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Content */}
              {(() => {
                const parsedContent = parseTicketContent(ticket.message);

                if (parsedContent.customer || parsedContent.order || parsedContent.details) {
                  return (
                    <div className="space-y-6">
                      {/* Customer Information */}
                      {parsedContent.customer && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                  <div className="text-sm text-gray-900 break-all">{parsedContent.customer.email}</div>
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
                        </div>
                      )}

                      {/* Order Information */}
                      {parsedContent.order && parsedContent.order.issueDate && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3"></div>
                            Order Information
                          </h4>
                          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-orange-800 mb-1">Issue Date</div>
                                <div className="text-sm font-bold text-gray-900">{parsedContent.order.issueDate}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Details */}
                      {parsedContent.details && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg mr-3"></div>
                            Additional Details
                          </h4>
                          <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg mr-4 mt-0.5 flex-shrink-0">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-sm text-gray-900 leading-relaxed font-medium">{parsedContent.details}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Attachments */}
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mr-3"></div>
                            Attachments ({ticket.attachments.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ticket.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="group p-4 bg-gradient-to-br from-indigo-50 to-purple-100/50 rounded-2xl border border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                                      <Paperclip className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-bold text-gray-900 truncate" title={attachment.fileName || attachment.originalName || attachment.filename || `attachment-${index + 1}`}>
                                        {attachment.fileName || attachment.originalName || attachment.filename || `attachment-${index + 1}`}
                                      </p>
                                      <p className="text-xs text-indigo-600 font-medium">
                                        {attachment.fileSize ? `LKR {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB` : attachment.size ? `LKR {(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded-lg">
                                    {attachment.fileType || attachment.mimetype || attachment.type || 'Unknown type'}
                                  </p>
                                  <div className="flex space-x-2">
                                    {(attachment.fileUrl || attachment.url) && (
                                      <button
                                        onClick={() => window.open(attachment.fileUrl || attachment.url, '_blank')}
                                        className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                      </button>
                                    )}
                                    {(attachment.fileUrl || attachment.path || attachment.url) && (
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = attachment.fileUrl || attachment.url || attachment.path;
                                          link.download = attachment.fileName || attachment.originalName || attachment.filename || `attachment-${index + 1}`;
                                          link.target = '_blank';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }}
                                        className="flex items-center px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-lg hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        Download
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // Fallback for unstructured content
                  return (
                    <div className="space-y-6">
                      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-3xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg mr-4 mt-0.5 flex-shrink-0">
                            <Info className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Ticket Description</h4>
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap font-medium">{ticket.message}</p>
                          </div>
                        </div>
                      </div>

                      {/* Attachments for Fallback */}
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg mr-3"></div>
                            Attachments ({ticket.attachments.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ticket.attachments.map((attachment, index) => (
                              <div
                                key={index}
                                className="group p-4 bg-gradient-to-br from-indigo-50 to-purple-100/50 rounded-2xl border border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                                      <Paperclip className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-bold text-gray-900 truncate" title={attachment.fileName || attachment.originalName || attachment.filename || `attachment-${index + 1}`}>
                                        {attachment.fileName || attachment.originalName || attachment.filename || `attachment-${index + 1}`}
                                      </p>
                                      <p className="text-xs text-indigo-600 font-medium">
                                        {attachment.fileSize ? `LKR {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB` : attachment.size ? `LKR {(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded-lg">
                                    {attachment.fileType || attachment.mimetype || attachment.type || 'Unknown type'}
                                  </p>
                                  <div className="flex space-x-2">
                                    {(attachment.fileUrl || attachment.url) && (
                                      <button
                                        onClick={() => window.open(attachment.fileUrl || attachment.url, '_blank')}
                                        className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                      </button>
                                    )}
                                    {(attachment.fileUrl || attachment.path || attachment.url) && (
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = attachment.fileUrl || attachment.url || attachment.path;
                                          link.download = attachment.fileName || attachment.originalName || attachment.filename || `attachment-${index + 1}`;
                                          link.target = '_blank';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }}
                                        className="flex items-center px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-lg hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        Download
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          {/* Conversation */}
          {ticket.replies && ticket.replies.length > 0 && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden hover:shadow-3xl transition-all duration-500">
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-8 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Conversation</h3>
                  </div>
                  <span className="px-6 py-2 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-indigo-800 text-sm font-bold rounded-2xl shadow-lg border border-indigo-200/50">
                    {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {ticket.replies.map((reply, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 ${reply.isStaff ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        reply.isStaff
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}>
                        {reply.isStaff ? (
                          <UserCheck className="w-6 h-6 text-white" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>

                    <div className={`flex-1 max-w-xl ${reply.isStaff ? 'text-right' : ''}`}>
                      <div className={`rounded-2xl p-6 shadow-sm ${
                        reply.isStaff
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
                      }`}>
                        <div className={`flex items-center justify-between mb-3 ${reply.isStaff ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center space-x-2 ${reply.isStaff ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <p className="text-sm font-semibold text-gray-900">
                              {reply.userId.name}
                            </p>
                            {reply.isStaff && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Staff
                              </span>
                            )}
                          </div>
                          <div className={`flex items-center space-x-2 ${reply.isStaff ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <p className={`text-xs text-gray-500 bg-white px-2 py-1 rounded-full ${
                              reply.isStaff ? 'text-right' : ''
                            }`}>
                              {formatDate(reply.createdAt)}
                              {reply.editedAt && (
                                <span className="text-gray-400 ml-1">(edited)</span>
                              )}
                            </p>
                            {/* Edit/Delete buttons for staff replies */}
                            {isAdmin && reply.isStaff && (
                              <div className="relative">
                                <button
                                  onClick={() => toggleReplyActions(reply._id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                  title="More actions"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {replyActions[reply._id] && (
                                  <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                                    <button
                                      onClick={() => {
                                        handleEditReply(reply._id, reply.message);
                                        setReplyActions({});
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteReply(reply._id);
                                        setReplyActions({});
                                      }}
                                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edit mode for reply */}
                        {editingReply === reply._id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editReplyMessage}
                              onChange={(e) => setEditReplyMessage(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              rows={3}
                              placeholder="Edit your reply..."
                            />
                            <div className={`flex items-center space-x-2 ${reply.isStaff ? 'justify-start' : 'justify-end'}`}>
                              <button
                                onClick={() => handleSaveReply(reply._id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center space-x-1"
                              >
                                <Save className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancelEditReply}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 flex items-center space-x-1"
                              >
                                <X className="w-3 h-3" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`text-sm text-gray-900 leading-relaxed ${reply.isStaff ? 'text-right' : ''}`}>
                            {reply.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Form */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden hover:shadow-3xl transition-all duration-500">
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-8 border-b border-gray-200/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {isAdmin ? 'Reply as Staff' : 'Add Your Reply'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSendReply} className="p-8">
              <div className="space-y-6">
                <div>
                  <textarea
                    id="reply"
                    rows={6}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    maxLength={500}
                    className="w-full border-2 border-gray-300 rounded-3xl px-6 py-4 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 resize-none shadow-xl transition-all duration-300 hover:shadow-2xl focus:shadow-2xl bg-white/80 backdrop-blur-sm text-base font-medium"
                    placeholder={isAdmin
                      ? "Type your staff response here..."
                      : "Type your reply here..."
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-600 bg-gray-100/80 backdrop-blur-sm px-4 py-2 rounded-2xl">
                    {replyMessage.length}/500 characters
                  </div>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyMessage.trim()}
                    className={`group flex items-center px-8 py-4 rounded-3xl font-bold shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:translate-y-0 ${
                      isAdmin
                        ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border border-white/20'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white border border-white/20'
                    }`}
                  >
                    {sendingReply ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
                        <span className="text-lg">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform duration-300" />
                        <span className="text-lg">Send {isAdmin ? 'Staff Reply' : 'Reply'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffTicketDetails;