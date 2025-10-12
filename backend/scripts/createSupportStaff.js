const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createSupportStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if support staff already exists
    const existingSupport = await User.findOne({ email: 'support@gmail.com' });
    if (existingSupport) {
      console.log('Support staff user already exists!');
      console.log('Email: support@gmail.com');
      console.log('Password: 123456');
      process.exit(0);
    }

    // Create support staff user
    const supportStaff = new User({
      name: 'Support Staff',
      email: 'support@gmail.com',
      password: '123456',
      role: 'support'
    });

    await supportStaff.save();
    console.log('Support staff user created successfully!');
    console.log('Email: support@gmail.com');
    console.log('Password: 123456');
    console.log('Role: support');

    process.exit(0);
  } catch (error) {
    console.error('Error creating support staff user:', error);
    process.exit(1);
  }
};

createSupportStaff();