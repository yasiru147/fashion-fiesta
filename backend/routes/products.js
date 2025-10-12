const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');

// Get all products (Public - for customers)
router.get('/', async (req, res) => {
  try {
    const { category, search, status, featured, minPrice, maxPrice, sort } = req.query;

    let query = {};

    // Filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const products = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOption);

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Get product by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// Create product (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      brand,
      sizes,
      colors,
      stock,
      images,
      featured,
      status,
      discount,
      tags
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      subCategory,
      brand,
      sizes,
      colors,
      stock,
      images,
      featured,
      status,
      discount,
      tags,
      createdBy: req.user._id
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
});

// Update product (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      price,
      category,
      subCategory,
      brand,
      sizes,
      colors,
      stock,
      images,
      featured,
      status,
      discount,
      tags
    } = req.body;

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (brand !== undefined) product.brand = brand;
    if (sizes !== undefined) product.sizes = sizes;
    if (colors !== undefined) product.colors = colors;
    if (stock !== undefined) product.stock = stock;
    if (images !== undefined) product.images = images;
    if (featured !== undefined) product.featured = featured;
    if (status !== undefined) product.status = status;
    if (discount !== undefined) product.discount = discount;
    if (tags !== undefined) product.tags = tags;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// Delete product (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// Get product statistics (Admin only)
router.get('/stats/overview', auth, adminOnly, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const inactiveProducts = await Product.countDocuments({ status: 'inactive' });
    const outOfStock = await Product.countDocuments({ status: 'out-of-stock' });
    const featuredProducts = await Product.countDocuments({ featured: true });

    // Total inventory value
    const products = await Product.find({ status: 'active' });
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

    // Category breakdown
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        outOfStock,
        featuredProducts,
        totalValue,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product statistics'
    });
  }
});

module.exports = router;
