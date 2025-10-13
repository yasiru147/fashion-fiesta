const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailService');

// Create new order (checkout)
router.post('/checkout', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify stock availability and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId.name} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      // Prepare order item
      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        image: product.images && product.images.length > 0 ? product.images[0] : null
      });

      // Reduce product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate totals
    const subtotal = cart.totalAmount;
    const shippingFee = 0; // Free shipping
    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + shippingFee + tax;

    // Create order
    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      notes
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order details
    await order.populate('userId', 'name email');

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(order, req.user);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Get single order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// Get all orders (Admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus, search, sortBy = '-createdAt' } = req.query;

    let query = {};

    // Filter by order status
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    // Filter by payment status
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    // Search by order number or customer name
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .sort(sortBy)
      .populate('userId', 'name email');

    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Update order status (Admin only)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    await order.populate('userId', 'name email');

    // Send order status update email
    try {
      await sendOrderStatusUpdateEmail(order, order.userId);
    } catch (emailError) {
      console.error('Failed to send order status update email:', emailError);
      // Don't fail the order update if email fails
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order'
    });
  }
});

// Update payment status (Admin only)
router.put('/:id/payment', auth, adminOnly, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();
    await order.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Payment status updated',
      order
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status'
    });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending or processing orders
    if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order at this stage'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = cancelReason;
    await order.save();
    await order.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Order cancelled',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
});

// Get order statistics (Admin only)
router.get('/stats/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics'
    });
  }
});

module.exports = router;
