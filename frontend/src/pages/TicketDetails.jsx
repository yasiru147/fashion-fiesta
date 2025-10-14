import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { uploadService } from '../services/uploadService';
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
  Trash2,
  MoreHorizontal,
  Upload,
  Plus
} from 'lucide-react';

const TicketDetails = () => {
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
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [newAttachments, setNewAttachments] = useState([]);
  const [replaceMode, setReplaceMode] = useState(false);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'support';
  const canEditAttachments = isAdmin || (user?.id === ticket?.customerId?._id);

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
      const response = await ticketService.addReply(id, replyMessage);
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
    setNewAttachments([]);
    // Reset form data to original values
    fetchTicket();
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

  // Attachment management functions
  const handleDeleteAttachment = async (attachmentIndex) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;

    try {
      const attachmentToDelete = ticket.attachments[attachmentIndex];

      // Delete from Cloudinary if it has a public_id
      if (attachmentToDelete?.public_id) {
        try {
          await uploadService.deleteFile(attachmentToDelete.public_id);
        } catch (cloudinaryError) {
          console.warn('Failed to delete file from Cloudinary:', cloudinaryError);
          // Continue with database update even if Cloudinary deletion fails
        }
      }

      const updatedAttachments = ticket.attachments.filter((_, index) => index !== attachmentIndex);
      const response = await ticketService.updateTicket(id, {
        attachments: updatedAttachments
      });

      if (response.success) {
        await fetchTicket();
        setSuccessMessage('Attachment deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setError('Failed to delete attachment');
      console.error(error);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setNewAttachments([...newAttachments, ...files]);
  };

  const handleUploadAttachments = async () => {
    if (newAttachments.length === 0) return;

    setUploadingAttachment(true);
    try {
      // Upload files to Cloudinary
      let newAttachmentData;
      if (replaceMode && selectedAttachmentIndex !== null) {
        // Replace mode: Upload single file
        const uploadResult = await uploadService.uploadSingleFile(newAttachments[0]);
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || 'Failed to upload file');
        }
        newAttachmentData = [{
          fileName: uploadResult.file.name,
          fileSize: uploadResult.file.size,
          fileType: uploadResult.file.type,
          fileUrl: uploadResult.file.url,
          public_id: uploadResult.file.public_id,
          uploadedAt: new Date().toISOString()
        }];
      } else {
        // Add mode: Upload multiple files
        const uploadResult = await uploadService.uploadMultipleFiles(newAttachments);
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || 'Failed to upload files');
        }
        newAttachmentData = uploadResult.files.map(file => ({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl: file.url,
          public_id: file.public_id,
          uploadedAt: new Date().toISOString()
        }));
      }

      let updatedAttachments;

      if (replaceMode && selectedAttachmentIndex !== null) {
        // Replace mode: Delete old file and replace the specific attachment
        const oldAttachment = ticket.attachments[selectedAttachmentIndex];
        if (oldAttachment?.public_id) {
          try {
            await uploadService.deleteFile(oldAttachment.public_id);
          } catch (cloudinaryError) {
            console.warn('Failed to delete old file from Cloudinary:', cloudinaryError);
            // Continue with replacement even if deletion fails
          }
        }

        updatedAttachments = [...(ticket.attachments || [])];
        updatedAttachments[selectedAttachmentIndex] = newAttachmentData[0]; // Replace with first new file
      } else {
        // Add mode: Combine existing attachments with new ones
        updatedAttachments = [...(ticket.attachments || []), ...newAttachmentData];
      }

      const response = await ticketService.updateTicket(id, {
        attachments: updatedAttachments
      });

      if (response.success) {
        await fetchTicket();
        setNewAttachments([]);

        // Show appropriate success message and reset replace mode
        if (replaceMode) {
          setSuccessMessage('Attachment replaced successfully');
          setReplaceMode(false);
          setSelectedAttachmentIndex(null);
        } else {
          setSuccessMessage('Attachments uploaded successfully');
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setError('Failed to upload attachments');
      console.error(error);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleRemoveNewAttachment = (index) => {
    setNewAttachments(newAttachments.filter((_, i) => i !== index));
  };

  const handleReplaceAttachment = (index) => {
    setReplaceMode(true);
    setSelectedAttachmentIndex(index);
    // Clear any existing new attachments when entering replace mode
    setNewAttachments([]);
  };

  const handleCancelReplace = () => {
    setReplaceMode(false);
    setSelectedAttachmentIndex(null);
    setNewAttachments([]);
  };

  const toggleReplyActions = (replyId) => {
    setReplyActions(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium">Ticket not found</h3>
          <p className="mt-1">The ticket you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Tickets
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Status Bar */}
            <div className={`h-2 w-full ${
              ticket.status === 'Open' ? 'bg-red-500' :
              ticket.status === 'In Progress' ? 'bg-yellow-500' :
              ticket.status === 'Resolved' ? 'bg-green-500' :
              'bg-gray-500'
            }`}></div>

            {/* Header Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl shadow-lg mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.subject}</h1>
                <div className="flex items-center justify-center space-x-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${statusColors[ticket.status]}`}>
                    <Clock className="w-4 h-4 mr-2" />
                    {ticket.status}
                  </span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${priorityColors[ticket.priority]}`}>
                    <Flag className="w-4 h-4 mr-2" />
                    {ticket.priority}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm">
                    <Tag className="w-4 h-4 mr-2" />
                    {ticket.category}
                  </span>
                </div>
              </div>

              {/* Ticket Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <User className="w-6 h-6 text-blue-600 mr-4" />
                  <div>
                    <div className="text-sm font-medium text-blue-800">Customer</div>
                    <div className="text-lg text-gray-900">{ticket.customerId?.name || ticket.customerId || 'Unknown'}</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-100">
                  <Calendar className="w-6 h-6 text-green-600 mr-4" />
                  <div>
                    <div className="text-sm font-medium text-green-800">Created</div>
                    <div className="text-lg text-gray-900">{formatDate(ticket.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <MessageCircle className="w-6 h-6 text-purple-600 mr-4" />
                  <div>
                    <div className="text-sm font-medium text-purple-800">Replies</div>
                    <div className="text-lg text-gray-900">{ticket.replies ? ticket.replies.length : 0} replies</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Admin Controls</h3>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Update Status:
                  </label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm"
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
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm hover:from-green-700 hover:to-emerald-700 shadow-lg transform transition-all duration-300 hover:scale-105"
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
                      {isEditing ? 'Edit Ticket' : 'Original Request'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      by {ticket.customerId.name} • {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </div>
                {/* Edit Button - Show only for ticket owner or admin */}
                {(() => {
                  const isOwner = user && ticket && (
                    user.id === ticket.customerId._id ||
                    user.id?.toString() === ticket.customerId._id?.toString() ||
                    String(user.id) === String(ticket.customerId._id)
                  );
                  return (isOwner || isAdmin);
                })() && (
                  <div className="flex items-center space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={saveLoading}
                          className="flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                        >
                          {saveLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditToggle}
                        className="flex items-center px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-all duration-300"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Form or Display Content */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={editFormData.subject}
                        onChange={handleEditFormChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={editFormData.category}
                          onChange={handleEditFormChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-white"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          id="priority"
                          name="priority"
                          value={editFormData.priority}
                          onChange={handleEditFormChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-white"
                        >
                          {priorities.map((priority) => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          name="customerName"
                          value={editFormData.customerName}
                          onChange={handleEditFormChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="customerEmail"
                          name="customerEmail"
                          value={editFormData.customerEmail}
                          onChange={handleEditFormChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={editFormData.phoneNumber}
                          onChange={handleEditFormChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="preferredContact" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Contact
                        </label>
                        <select
                          id="preferredContact"
                          name="preferredContact"
                          value={editFormData.preferredContact}
                          onChange={handleEditFormChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-white"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Order Number
                        </label>
                        <input
                          type="text"
                          id="orderNumber"
                          name="orderNumber"
                          value={editFormData.orderNumber}
                          onChange={handleEditFormChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                          placeholder="e.g., ORD12345"
                        />
                      </div>
                      <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Issue Date
                        </label>
                        <input
                          type="date"
                          id="issueDate"
                          name="issueDate"
                          value={editFormData.issueDate}
                          onChange={handleEditFormChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h4>
                    <div>
                      <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-2">
                        Describe your issue in detail
                      </label>
                      <textarea
                        id="additionalDetails"
                        name="additionalDetails"
                        rows={6}
                        value={editFormData.additionalDetails}
                        onChange={handleEditFormChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-none"
                        placeholder="Please provide as much detail as possible about your issue..."
                      />
                    </div>
                  </div>
                </form>
              ) : (
                // Display Mode
                (() => {
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
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Information</h4>
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-orange-600 mr-3" />
                                <div>
                                  <div className="text-xs font-medium text-orange-800">Issue Date</div>
                                  <div className="text-sm text-gray-900">{parsedContent.order.issueDate}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Details */}
                        {parsedContent.details && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Details</h4>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-start">
                                <FileText className="w-4 h-4 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-900 leading-relaxed">{parsedContent.details}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // Fallback for unstructured content
                    return (
                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start">
                          <Info className="w-5 h-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Ticket Description</h4>
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()
              )}

              {/* Attachments Section */}
              {/* <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Attachments ({ticket.attachments ? ticket.attachments.length : 0})
                  </h4>
                </div> */}

                {/* Show attachments if they exist */}
                {/* {ticket.attachments && ticket.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ticket.attachments && ticket.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <FileText className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate">
                                {attachment.fileName}
                              </h5>
                              <p className="text-xs text-gray-500">
                                {attachment.fileType} • {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(attachment.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => window.open(attachment.fileUrl, '_blank')}
                              className="flex-shrink-0 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                              title="Download/View File"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {isEditing && canEditAttachments && (
                              <>
                                <button
                                  onClick={() => handleReplaceAttachment(index)}
                                  className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="Replace Attachment"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAttachment(index)}
                                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Delete Attachment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div> */}
                {/* ) : (
                  
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No attachments uploaded yet</p>
                  </div>
                )} */}


                {/* Add New Attachments Section */}
                {isEditing && canEditAttachments && (
                    <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {replaceMode ? `Replace: ${ticket.attachments[selectedAttachmentIndex]?.fileName}` : 'Add New Attachments'}
                          </label>
                          <input
                            type="file"
                            multiple={!replaceMode}
                            onChange={handleFileSelect}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                          />
                        </div>

                        {/* Preview new attachments */}
                        {newAttachments.length > 0 && (
                          <div className="space-y-2">
                            <h6 className="text-sm font-medium text-gray-700">Selected Files:</h6>
                            {newAttachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                <span className="text-sm text-gray-900 truncate">
                                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                                <button
                                  onClick={() => handleRemoveNewAttachment(index)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center space-x-3 pt-3">
                          <button
                            onClick={handleUploadAttachments}
                            disabled={newAttachments.length === 0 || uploadingAttachment}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {uploadingAttachment ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>{uploadingAttachment ?
                              (replaceMode ? 'Replacing...' : 'Uploading...') :
                              (replaceMode ? 'Replace File' : 'Upload Files')
                            }</span>
                          </button>
                          {replaceMode ? (
                            <button
                              onClick={handleCancelReplace}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                              Cancel Replace
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setNewAttachments([]);
                              }}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                              Clear Files
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Conversation */}
          {ticket.replies && ticket.replies.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <MessageSquare className="w-6 h-6 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Conversation</h3>
                  <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                    {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {console.log('Replies data:', ticket.replies)}
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
                            {console.log('Debug:', { isAdmin, replyIsStaff: reply.isStaff, userRole: user?.role, condition: isAdmin && reply.isStaff })}
                            {/* Test button - should always show for staff replies */}
                            {reply.isStaff && (
                              <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 border border-red-500">
                                TEST
                              </button>
                            )}
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Send className="w-6 h-6 text-indigo-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {isAdmin ? 'Reply as Staff' : 'Add Your Reply'}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSendReply} className="p-6">
              <div className="space-y-4">
                <div>
                  <textarea
                    id="reply"
                    rows={4}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-primary-500 focus:border-primary-500 resize-none shadow-sm transition-all duration-300 hover:shadow-md focus:shadow-lg"
                    placeholder={isAdmin
                      ? "Type your staff response here..."
                      : "Type your reply here..."
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {replyMessage.length}/500 characters
                  </div>
                  <button
                    type="submit"
                    disabled={sendingReply || !replyMessage.trim()}
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${
                      isAdmin
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        : 'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white'
                    }`}
                  >
                    {sendingReply ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send {isAdmin ? 'Staff Reply' : 'Reply'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    // </div>
  );
};

export default TicketDetails;