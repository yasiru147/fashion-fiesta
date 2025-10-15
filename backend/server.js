const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with better error handling and local fallback
const connectDB = async () => {
  try {
    // First try Atlas connection
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv')) {
      console.log('Attempting MongoDB Atlas connection...');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      });
      console.log('MongoDB Atlas connected successfully');
    } else {
      // Fallback to local MongoDB
      console.log('Connecting to local MongoDB...');
      await mongoose.connect('mongodb://localhost:27017/fashion-fiesta', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Local MongoDB connected successfully');
    }
  } catch (error) {
    console.error('MongoDB Atlas connection failed, trying local MongoDB:', error.message);
    try {
      await mongoose.connect('mongodb://localhost:27017/fashion-fiesta', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Local MongoDB connected successfully as fallback');
    } catch (localError) {
      console.error('Both MongoDB Atlas and local MongoDB failed:', localError.message);
      console.log('Starting server without database connection for demo purposes...');
    }
  }
};

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/test', require('./routes/testEmail'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reports', require('./routes/reports'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Fashion Fiesta API is running!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});