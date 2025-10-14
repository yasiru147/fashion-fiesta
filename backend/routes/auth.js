const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Mock users for demo when database is not available
const mockUsers = [
  {
    _id: '1',
    id: '1',
    name: 'Admin User',
    email: 'admin@fashionfiesta.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    _id: '2',
    id: '2',
    name: 'Support Staff',
    email: 'support@fashionfiesta.com',
    password: 'support123',
    role: 'support'
  },
  {
    _id: '3',
    id: '3',
    name: 'John Customer',
    email: 'customer@example.com',
    password: 'customer123',
    role: 'customer'
  },
  {
    _id: '4',
    id: '4',
    name: 'Ravindu Pasanjith',
    email: 'ravindupasanjith1542@gmail.com',
    password: 'Dinuka@111',
    role: 'customer'
  }
];

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'customer'
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try database first
    try {
      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Invalid credentials'
          });
        }

        const token = generateToken(user._id);

        return res.json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    } catch (dbError) {
      console.log('Database not available, using mock authentication');
    }

    // Fallback to mock users if database is unavailable
    console.log('Attempting mock login with email:', email);
    const mockUser = mockUsers.find(u => u.email === email && u.password === password);

    if (!mockUser) {
      console.log('Available mock users:');
      mockUsers.forEach(u => console.log(`- Email: ${u.email}, Password: ${u.password}`));
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(mockUser._id);

    res.json({
      success: true,
      token,
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password'
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      user.password = newPassword;
    }

    // Update name and email if provided
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

module.exports = router;