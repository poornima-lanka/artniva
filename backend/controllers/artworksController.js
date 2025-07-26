// backend/controllers/artworksController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Material = require('../models/Material'); // Make sure this line exists
const User = require('../models/User');

// ... (other controller functions)

// @desc    Fetch all artworks and materials
// @route   GET /api/shop
// @access  Public
const getCombinedShopItems = asyncHandler(async (req, res) => {
  const product = await Product.find({});
  const materials = await Material.find({});

  const combinedItems = {
    product,
    materials
  };

  res.json(combinedItems);
});

// Make sure to export the new function
module.exports = {
  // ... (other exports)
  getCombinedShopItems
};