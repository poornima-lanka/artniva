// backend/controllers/productController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc  Fetch all products
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @desc  Fetch a single product by ID
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc  Create a new product
// @route POST /api/products
// @access Private/Seller
const createProduct = asyncHandler(async (req, res) => {
  const { name, image, description, category, price, countInStock } = req.body;

  const product = new Product({
    user: req.user._id,
    name,
    image,
    description,
    category,
    price,
    countInStock,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc  Update a product
// @route PUT /api/products/:id
// @access Private/Seller
const updateProduct = asyncHandler(async (req, res) => {
  const { name, image, description, category, price, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.image = image;
    product.description = description;
    product.category = category;
    product.price = price;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc  Delete a product
// @route DELETE /api/products/:id
// @access Private/Seller/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc  Get products created by the logged-in seller
// @route GET /api/products/myproducts
// @access Private/Seller
const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  res.json(products);
});

// @desc  Create new review
// @route POST /api/products/:id/reviews
// @access Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc  Toggle like status for a product
// @route POST /api/products/:id/like
// @access Private
const likeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const isLiked = product.likes.some(
      (like) => like.toString() === req.user._id.toString()
    );
    if (isLiked) {
      product.likes.pull(req.user._id); // Use Mongoose's pull method to remove the ID
    } else {
      product.likes.push(req.user._id); // Use Mongoose's push to add the ID
    }
    await product.save();
    res.status(200).json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc  Get products liked by the logged-in user
// @route GET /api/products/liked
// @access Private
const getLikedProducts = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated');
  }
  const likedProducts = await Product.find({
    likes: { $in: [req.user._id] }
  });
  res.json(likedProducts);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  createProductReview,
  likeProduct,
  getLikedProducts,
};