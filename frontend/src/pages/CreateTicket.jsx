import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import {
  Send,
  AlertCircle,
  FileText,
  MessageSquare,
  Tag,
  Flag,
  Info,
  ArrowLeft,
  CheckCircle,
  Clock,
  Upload,
  X,
  File,
  User,
  Mail,
  Phone,
  ShoppingBag,
  Calendar,
  MessageCircle,
  Settings
} from 'lucide-react';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    category: 'General',
    priority: 'Medium',
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    phoneNumber: '',
    orderNumber: '',
    issueDate: new Date().toISOString().split('T')[0], // Set current date as default
    additionalDetails: '',
    preferredContact: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);

  // Auto-fill user data when available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail
      }));
    }
  }, [user]);

  const categories = [
    { value: 'General', icon: '💬', description: 'General inquiries and questions' },
    { value: 'Order Issue', icon: '📦', description: 'Problems with your orders' },
    { value: 'Payment', icon: '💳', description: 'Payment and billing issues' },
    { value: 'Return/Refund', icon: '🔄', description: 'Returns and refund requests' },
    { value: 'Technical', icon: '🔧', description: 'Technical problems and bugs' },
    { value: 'Product Question', icon: '❓', description: 'Questions about products' }
  ];

  const priorities = [
    { value: 'Low', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { value: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { value: 'High', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { value: 'Urgent', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone number - only allow digits and max 10 characters
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, ''); // Remove non-digits
      if (digitsOnly.length <= 10) {
        setFormData({
          ...formData,
          [name]: digitsOnly
        });
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} is not a supported format.`);
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > 5) {
      setError('Maximum 5 files allowed.');
      return;
    }

    setAttachments([...attachments, ...validFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('subject', formData.subject);

      // Create comprehensive message from all form fields
      const message = `
CUSTOMER INFORMATION:
Name: ${formData.customerName}
Email: ${formData.customerEmail}
Phone: ${formData.phoneNumber || 'Not provided'}
Preferred Contact: ${formData.preferredContact}

ORDER INFORMATION:
Order Number: ${formData.orderNumber || 'Not applicable'}
Issue Date: ${formData.issueDate || 'Not specified'}

ADDITIONAL DETAILS:
${formData.additionalDetails || 'No additional details provided'}

CATEGORY: ${formData.category}
PRIORITY: ${formData.priority}
      `.trim();

      submitData.append('message', message);
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority);

      // Append files
      attachments.forEach((file) => {
        submitData.append('attachments', file);
      });

      const response = await ticketService.createTicketWithFiles(submitData);
      if (response.success) {
        navigate('/my-tickets');
      }
    } catch (error) {
      setError('Failed to create ticket. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const selectedPriority = priorities.find(pri => pri.value === formData.priority);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl shadow-lg mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Support Ticket</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Need assistance? Our expert support team is here to help you resolve any issues quickly and efficiently.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                    <FileText className="w-5 h-5 mr-2 text-primary-500" />
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={200}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                    placeholder="Brief description of your issue (e.g., 'Unable to complete payment')"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {formData.subject.length}/200 characters
                  </div>
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                      <Tag className="w-5 h-5 mr-2 text-primary-500" />
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 appearance-none"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.value}
                        </option>
                      ))}
                    </select>
                    {selectedCategory && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 flex items-center">
                          <span className="text-lg mr-2">{selectedCategory.icon}</span>
                          {selectedCategory.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                      <Flag className="w-5 h-5 mr-2 text-primary-500" />
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 appearance-none"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.value}
                        </option>
                      ))}
                    </select>
                    {selectedPriority && (
                      <div className={`mt-2 p-3 rounded-lg border ${selectedPriority.bg} ${selectedPriority.border}`}>
                        <p className={`text-sm font-medium ${selectedPriority.color}`}>
                          {formData.priority} Priority
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formData.priority === 'Urgent'
                            ? 'Critical issues affecting service availability'
                            : formData.priority === 'High'
                            ? 'Important issues requiring prompt attention'
                            : formData.priority === 'Medium'
                            ? 'Standard issues with moderate impact'
                            : 'Non-critical issues that can be addressed when convenient'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                      <User className="w-5 h-5 mr-2 text-primary-500" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      readOnly
                      className="w-full px-4 py-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-700 cursor-not-allowed transition-all duration-300"
                      placeholder="Your name will be auto-filled from your account"
                    />
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <Info className="w-4 h-4 mr-1" />
                      This field is automatically filled from your account information
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                      <Mail className="w-5 h-5 mr-2 text-primary-500" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      required
                      value={formData.customerEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                    <Phone className="w-5 h-5 mr-2 text-primary-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 ${
                      formData.phoneNumber.length > 0 && formData.phoneNumber.length < 10
                        ? 'border-amber-300 bg-amber-50'
                        : formData.phoneNumber.length === 10
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit phone number (e.g., 0712345678)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Enter exactly 10 digits (no spaces or special characters)
                    </div>
                    <div className={`text-sm font-medium ${
                      formData.phoneNumber.length === 0
                        ? 'text-gray-400'
                        : formData.phoneNumber.length < 10
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }`}>
                      {formData.phoneNumber.length}/10 digits
                    </div>
                  </div>
                  {formData.phoneNumber.length > 0 && formData.phoneNumber.length < 10 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Please enter {10 - formData.phoneNumber.length} more digit(s) to complete your phone number
                      </p>
                    </div>
                  )}
                  {formData.phoneNumber.length === 10 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Phone number format is correct!
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                      <ShoppingBag className="w-5 h-5 mr-2 text-primary-500" />
                      Order Number
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                      placeholder="e.g., #FF2024001 (if applicable)"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                      <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                      Issue Date
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      When did this issue occur? (Cannot select future dates)
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                    <MessageCircle className="w-5 h-5 mr-2 text-primary-500" />
                    Additional Details
                  </label>
                  <textarea
                    name="additionalDetails"
                    rows={4}
                    value={formData.additionalDetails}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 resize-none"
                    placeholder="Any additional information that might help us resolve your issue..."
                  />
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                    <Settings className="w-5 h-5 mr-2 text-primary-500" />
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="text-gray-700">Email</span>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="text-gray-700">Phone</span>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-300">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="both"
                        checked={formData.preferredContact === 'both'}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="text-gray-700">Both</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                    <Upload className="w-5 h-5 mr-2 text-primary-500" />
                    Attachments (Optional)
                  </label>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-all duration-300">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, PDF, DOC, DOCX, TXT (Max 10MB each, up to 5 files)
                      </span>
                    </label>
                  </div>

                  {/* File List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Selected Files ({attachments.length}/5):
                      </div>
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center">
                            <File className="w-4 h-4 text-primary-500 mr-2" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-sm text-gray-500">
                    Attach relevant screenshots, documents, or files that might help resolve your issue faster
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl shadow-lg hover:from-primary-700 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary-500/50"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Create Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <Info className="w-6 h-6 text-primary-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Support Information</h3>
              </div>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Response Time</p>
                    <p>We typically respond within 2-4 hours during business hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Resolution Rate</p>
                    <p>98% of tickets resolved on first response</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  to="/my-tickets"
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div className="font-medium text-gray-900">My Tickets</div>
                  <div className="text-sm text-gray-500">View your existing tickets</div>
                </Link>
                <Link
                  to="/"
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <div className="font-medium text-gray-900">Help Center</div>
                  <div className="text-sm text-gray-500">Browse FAQs and guides</div>
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-primary-500 to-accent-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Need Immediate Help?</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">📧 Email Support</p>
                  <p className="opacity-90">support@fashionfiesta.com</p>
                </div>
                <div>
                  <p className="font-medium">📞 Phone Support</p>
                  <p className="opacity-90">+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="font-medium">🕒 Business Hours</p>
                  <p className="opacity-90">Mon-Fri: 9AM-6PM EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;