const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createCustomer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if customer already exists
    const existingCustomer = await User.findOne({ email: 'customer@gmail.com' });
    if (existingCustomer) {
      console.log('Customer user already exists!');
      console.log('Email: customer@gmail.com');
      console.log('Password: 123456');
      process.exit(0);
    }

    // Create customer user
    const customer = new User({
      name: 'Customer User',
      email: 'customer@gmail.com',
      password: '123456',
      role: 'customer'
    });

    await customer.save();
    console.log('Customer user created successfully!');
    console.log('Email: customer@gmail.com');
    console.log('Password: 123456');
    console.log('Role: customer');

    process.exit(0);
  } catch (error) {
    console.error('Error creating customer user:', error);
    process.exit(1);
  }
};

createCustomer();