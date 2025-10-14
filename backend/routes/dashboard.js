const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { getDashboardStats, getSidebarStats } = require('../controllers/dashboardController');

// Get dashboard statistics (requires authentication)
router.get('/stats', auth, getDashboardStats);

// Get sidebar statistics (requires authentication)
router.get('/sidebar-stats', auth, getSidebarStats);

module.exports = router;