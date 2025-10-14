const express = require('express');
const { sendStaffReplyNotification } = require('../services/emailService');
const router = express.Router();

// Test email endpoint - for development/debugging only
router.get('/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email service...');

    // Mock data for testing
    const mockTicket = {
      _id: '507f1f77bcf86cd799439011',
      subject: 'Test Email Notification',
      status: 'In Progress',
      priority: 'Medium',
      customerId: {
        name: 'Test Customer',
        email: 'test@example.com'
      }
    };

    const mockReply = {
      message: 'This is a test reply from staff to verify email functionality is working correctly.',
      userId: {
        name: 'Test Staff',
        role: 'support'
      },
      isStaff: true,
      createdAt: new Date()
    };

    const mockStaff = {
      name: 'Test Support Staff',
      role: 'support'
    };

    console.log('🧪 Calling email service with mock data...');
    const emailResult = await sendStaffReplyNotification(mockTicket, mockReply, mockStaff);

    console.log('🧪 Email service result:', emailResult);

    res.json({
      success: true,
      message: 'Email test completed',
      result: emailResult,
      note: 'Check backend console for detailed email logs'
    });
  } catch (error) {
    console.error('🧪 Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

module.exports = router;