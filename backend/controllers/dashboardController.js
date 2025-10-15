const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeStaff = await User.countDocuments({ role: { $in: ['admin', 'support'] } });
    const customers = await User.countDocuments({ role: 'customer' });

    // Get today's new users
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

    // Get ticket statistics
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: { $in: ['Open', 'open'] } });
    const inProgressTickets = await Ticket.countDocuments({ status: { $in: ['In Progress', 'in-progress'] } });
    const resolvedTickets = await Ticket.countDocuments({ status: { $in: ['Resolved', 'resolved', 'Closed', 'closed'] } });
    const pendingTickets = await Ticket.countDocuments({ status: { $in: ['Pending', 'pending'] } });

    // Get tickets assigned to current user (if staff)
    const myTickets = await Ticket.countDocuments({
      assignedTo: req.user._id,
      status: { $nin: ['Resolved', 'resolved', 'Closed', 'closed'] }
    });

    // Get today's resolved tickets
    const resolvedToday = await Ticket.countDocuments({
      status: { $in: ['Resolved', 'resolved', 'Closed', 'closed'] },
      updatedAt: { $gte: today }
    });

    // Get this month's resolved tickets
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const monthlyResolved = await Ticket.countDocuments({
      status: { $in: ['Resolved', 'resolved', 'Closed', 'closed'] },
      updatedAt: { $gte: firstDayOfMonth }
    });

    // Calculate average response time (in hours)
    const ticketsWithReplies = await Ticket.find({
      'replies.0': { $exists: true }
    });

    let totalResponseTime = 0;
    let ticketsWithResponse = 0;

    ticketsWithReplies.forEach(ticket => {
      if (ticket.replies && ticket.replies.length > 0) {
        const firstReply = ticket.replies.find(r => r.isStaff);
        if (firstReply) {
          const responseTime = (new Date(firstReply.createdAt) - new Date(ticket.createdAt)) / (1000 * 60 * 60);
          totalResponseTime += responseTime;
          ticketsWithResponse++;
        }
      }
    });

    const avgResponseTime = ticketsWithResponse > 0
      ? (totalResponseTime / ticketsWithResponse).toFixed(1)
      : '0';

    // Calculate satisfaction rate (based on resolved tickets ratio)
    const satisfactionRate = totalTickets > 0
      ? ((resolvedTickets / totalTickets) * 100).toFixed(1)
      : '0';

    // Get recent tickets for activity feed
    const recentTickets = await Ticket.find()
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get priority tickets count
    const highPriorityTickets = await Ticket.countDocuments({
      priority: { $in: ['High', 'high'] },
      status: { $nin: ['Resolved', 'resolved', 'Closed', 'closed'] }
    });

    // Get order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });

    // Get today's orders
    const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });

    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ stock: { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    // Build recent activity from orders, users, and tickets
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(3);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(2);

    const recentActivity = [];

    // Add recent users
    recentUsers.forEach(user => {
      const timeDiff = Date.now() - new Date(user.createdAt).getTime();
      const timeAgo = timeDiff < 3600000 ? `${Math.floor(timeDiff / 60000)} min ago` :
                      timeDiff < 86400000 ? `${Math.floor(timeDiff / 3600000)} hour ago` :
                      `${Math.floor(timeDiff / 86400000)} day ago`;

      recentActivity.push({
        type: 'user',
        message: `New user registration: ${user.email}`,
        time: timeAgo,
        icon: 'UserCheck',
        color: 'text-green-500'
      });
    });

    // Add recent orders
    recentOrders.forEach(order => {
      const timeDiff = Date.now() - new Date(order.createdAt).getTime();
      const timeAgo = timeDiff < 3600000 ? `${Math.floor(timeDiff / 60000)} min ago` :
                      timeDiff < 86400000 ? `${Math.floor(timeDiff / 3600000)} hour ago` :
                      `${Math.floor(timeDiff / 86400000)} day ago`;

      recentActivity.push({
        type: 'order',
        message: `New order ${order.orderNumber} - LKR ${order.totalAmount.toFixed(2)}`,
        time: timeAgo,
        icon: 'ShoppingBag',
        color: 'text-blue-500'
      });
    });

    // Add recent tickets
    recentTickets.slice(0, 2).forEach(ticket => {
      const timeDiff = Date.now() - new Date(ticket.createdAt).getTime();
      const timeAgo = timeDiff < 3600000 ? `${Math.floor(timeDiff / 60000)} min ago` :
                      timeDiff < 86400000 ? `${Math.floor(timeDiff / 3600000)} hour ago` :
                      `${Math.floor(timeDiff / 86400000)} day ago`;

      let icon = 'Ticket';
      let color = 'text-gray-500';

      if (ticket.status === 'Resolved' || ticket.status === 'resolved') {
        icon = 'CheckCircle';
        color = 'text-green-500';
      } else if (ticket.priority === 'High' || ticket.priority === 'high') {
        icon = 'AlertCircle';
        color = 'text-red-500';
      }

      recentActivity.push({
        type: 'ticket',
        message: ticket.status === 'Resolved' ? `Ticket marked as resolved` : `New ${ticket.priority || 'normal'} priority ticket created`,
        time: timeAgo,
        icon,
        color
      });
    });

    // Sort by most recent
    recentActivity.sort((a, b) => {
      const getMinutes = (timeStr) => {
        const match = timeStr.match(/(\d+)\s+(min|hour|day)/);
        if (!match) return 0;
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'min') return value;
        if (unit === 'hour') return value * 60;
        if (unit === 'day') return value * 1440;
        return 0;
      };
      return getMinutes(a.time) - getMinutes(b.time);
    });

    res.json({
      success: true,
      stats: {
        // User stats
        totalUsers,
        activeStaff,
        customers,
        newUsersToday,
        // Ticket stats
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        pendingTickets,
        myTickets,
        resolvedToday,
        monthlyResolved,
        avgResponseTime: `${avgResponseTime}h`,
        satisfactionRate: `${satisfactionRate}%`,
        highPriorityTickets,
        // Order stats
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        ordersToday,
        // Product stats
        totalProducts,
        activeProducts,
        outOfStockProducts,
        // Activity
        recentActivity: recentActivity.slice(0, 5),
        recentTickets
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

const getSidebarStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total tickets
    const totalTickets = await Ticket.countDocuments();

    // Get active staff (admin + support)
    const activeStaff = await User.countDocuments({ role: { $in: ['admin', 'support'] } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTickets,
        activeStaff
      }
    });
  } catch (error) {
    console.error('Sidebar stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sidebar statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getSidebarStats
};