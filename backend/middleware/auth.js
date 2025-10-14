const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock users for when database is not available
const mockUsers = [
  {
    _id: '1',
    id: '1',
    name: 'Admin User',
    email: 'admin@fashionfiesta.com',
    role: 'admin'
  },
  {
    _id: '2',
    id: '2',
    name: 'Support Staff',
    email: 'support@fashionfiesta.com',
    role: 'support'
  },
  {
    _id: '3',
    id: '3',
    name: 'John Customer',
    email: 'customer@example.com',
    role: 'customer'
  },
  {
    _id: '4',
    id: '4',
    name: 'Ravindu Pasanjith',
    email: 'ravindupasanjith1542@gmail.com',
    role: 'customer'
  }
];

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Try database first
    let user;
    try {
      user = await User.findById(decoded.userId).select('-password');
    } catch (dbError) {
      // If database fails, use mock users
      console.log('Database not available, using mock user');
      user = mockUsers.find(u => u._id === decoded.userId);
    }

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});

    if (req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({ message: 'Access denied. Admin/Support role required.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const adminOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = { auth, adminAuth, adminOnly };