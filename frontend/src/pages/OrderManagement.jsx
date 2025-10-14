import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import {
  Package,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  Download,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    orderStatus: '',
    trackingNumber: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/stats/dashboard', {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };
   
  //validation part for update form
  const handleUpdateStatus = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/orders/${selectedOrder._id}/status`,
        updateData,
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        alert('Order updated successfully!');
        setShowUpdateModal(false);
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert(error.response?.data?.message || 'Error updating order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      processing: 'bg-blue-100 text-blue-700 border-blue-300',
      shipped: 'bg-purple-100 text-purple-700 border-purple-300',
      delivered: 'bg-green-100 text-green-700 border-green-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Generate PDF for single order
  const generateOrderPDF = (order) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Fashion Fiesta', 20, 20);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Order Invoice', 20, 30);

    // Order Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Order Number: ${order.orderNumber}`, 20, 50);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 57);
    doc.text(`Status: ${order.orderStatus.toUpperCase()}`, 20, 64);

    // Customer Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information', 20, 78);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${order.userId?.name || 'N/A'}`, 20, 86);
    doc.text(`Email: ${order.userId?.email || 'N/A'}`, 20, 93);

    // Shipping Address
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Shipping Address', 20, 107);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(order.shippingAddress.fullName, 20, 115);
    doc.text(order.shippingAddress.address, 20, 122);
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 20, 129);
    doc.text(order.shippingAddress.country, 20, 136);
    doc.text(`Phone: ${order.shippingAddress.phone}`, 20, 143);

    // Items Table
    const tableData = order.items.map(item => [
      item.name,
      item.quantity,
      `LKR ${item.price.toFixed(2)}`,
      item.selectedSize || '-',
      item.selectedColor || '-',
      `LKR ${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 155,
      head: [['Product', 'Qty', 'Price', 'Size', 'Color', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237] },
      margin: { left: 20, right: 20 }
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: LKR ${order.subtotal.toFixed(2)}`, 130, finalY);
    doc.text(`Shipping: FREE`, 130, finalY + 7);
    doc.text(`Tax (10%): LKR ${order.tax.toFixed(2)}`, 130, finalY + 14);

    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text(`Total: LKR ${order.totalAmount.toFixed(2)}`, 130, finalY + 24);

    // Payment Info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Payment Method: ${order.paymentMethod.replace('_', ' ').toUpperCase()}`, 20, finalY + 24);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 20, finalY + 31);

    if (order.trackingNumber) {
      doc.text(`Tracking Number: ${order.trackingNumber}`, 20, finalY + 38);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for shopping with Fashion Fiesta!', 105, 280, { align: 'center' });

    doc.save(`Order_${order.orderNumber}.pdf`);
  };

  // Generate PDF for all orders
  const generateAllOrdersPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Fashion Fiesta', 20, 20);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('All Orders Report', 20, 30);

    // Date
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Total Orders: ${filteredOrders.length}`, 20, 57);

    // Orders Table
    const tableData = filteredOrders.map(order => [
      order.orderNumber,
      order.userId?.name || 'N/A',
      new Date(order.createdAt).toLocaleDateString(),
      order.orderStatus.toUpperCase(),
      order.paymentStatus.toUpperCase(),
      `LKR ${order.totalAmount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Order #', 'Customer', 'Date', 'Status', 'Payment', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 }
    });

    // Summary Stats
    const finalY = doc.lastAutoTable.finalY + 15;
    const totalRevenue = filteredOrders.reduce((sum, order) =>
      order.paymentStatus === 'paid' ? sum + order.totalAmount : sum, 0
    );

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', 20, finalY);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Revenue: LKR ${totalRevenue.toFixed(2)}`, 20, finalY + 7);
    doc.text(`Paid Orders: ${filteredOrders.filter(o => o.paymentStatus === 'paid').length}`, 20, finalY + 14);
    doc.text(`Pending Orders: ${filteredOrders.filter(o => o.orderStatus === 'pending').length}`, 20, finalY + 21);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Fashion Fiesta - Order Management System', 105, 280, { align: 'center' });

    doc.save(`All_Orders_${new Date().toLocaleDateString()}.pdf`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600">Manage and track all customer orders</p>
          </div>
          <button
            onClick={generateAllOrdersPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <FileText className="w-5 h-5" />
            Export All to PDF
          </button>
        
          
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-10 h-10 opacity-80" />
                <span className="text-3xl font-black">{stats.totalOrders}</span>
              </div>
              <p className="text-purple-100 font-medium">Total Orders</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-10 h-10 opacity-80" />
                <span className="text-3xl font-black">{stats.pendingOrders}</span>
              </div>
              <p className="text-blue-100 font-medium">Pending Orders</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-10 h-10 opacity-80" />
                <span className="text-3xl font-black">{stats.deliveredOrders}</span>
              </div>
              <p className="text-green-100 font-medium">Delivered</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-10 h-10 opacity-80" />
                <span className="text-3xl font-black">LKR {stats.totalRevenue.toFixed(0)}</span>
              </div>
              <p className="text-pink-100 font-medium">Total Revenue</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            {/*validation part */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.userId?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{order.userId?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.items.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-purple-600">
                        LKR {order.totalAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-700 font-semibold"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setUpdateData({
                              orderStatus: order.orderStatus,
                              trackingNumber: order.trackingNumber || ''
                            });
                            setShowUpdateModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                          title="Update Status"
                        >
                          <TrendingUp className="w-5 h-5" />
                        </button>
                         
                        
                        <button
                          onClick={() => generateOrderPDF(order)}
                          className="text-green-600 hover:text-green-700 font-semibold"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                      
                    </td>
                    
                  </tr>
                ))}
              </tbody>

              
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between text-white">
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                    <p className="font-bold text-gray-900">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="font-bold text-gray-900">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer</p>
                    <p className="font-bold text-gray-900">{selectedOrder.userId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-bold text-gray-900">{selectedOrder.userId?.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-purple-600" />
                    Shipping Address
                  </h3>
                  <p className="text-sm text-gray-700">
                    {selectedOrder.shippingAddress.fullName}<br />
                    {selectedOrder.shippingAddress.address}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                    {selectedOrder.shippingAddress.country}<br />
                    Phone: {selectedOrder.shippingAddress.phone}
                  </p>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × LKR {item.price.toFixed(2)}
                            {item.selectedSize && <span className="ml-2">Size: {item.selectedSize}</span>}
                            {item.selectedColor && <span className="ml-2">Color: {item.selectedColor}</span>}
                          </p>
                        </div>
                        <p className="font-bold text-purple-600">
                          LKR {(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-purple-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">LKR {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">
                      {selectedOrder.shippingFee === 0 ? 'FREE' : `LKR {selectedOrder.shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span className="font-semibold">LKR {selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-purple-600">LKR {selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Order Notes:</p>
                    <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between text-white">
                  <h2 className="text-2xl font-bold">Update Order Status</h2>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    value={updateData.orderStatus}
                    onChange={(e) => setUpdateData({ ...updateData, orderStatus: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={updateData.trackingNumber}
                    onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;
