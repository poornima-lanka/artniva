// backend/controllers/materialController.js
const asyncHandler = require('express-async-handler');
const Material = require('../models/Material');

// @desc    Fetch all materials
// @route   GET /api/materials
// @access  Public
const getMaterials = asyncHandler(async (req, res) => {
  const materials = await Material.find({});
  res.json(materials);
});

// @desc    Fetch a single material by ID
// @route   GET /api/materials/:id
// @access  Public
const getMaterialById = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (material) {
    res.json(material);
  } else {
    res.status(404);
    throw new Error('Material not found');
  }
});

// @desc    Toggle like status for a material
// @route   POST /api/materials/:id/like
// @access  Private
const likeMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (material) {
    const isLiked = material.likes.some(
      (like) => like.toString() === req.user._id.toString()
    );
    if (isLiked) {
      material.likes.pull(req.user._id);
    } else {
      material.likes.push(req.user._id);
    }
    await material.save();
    res.status(200).json(material);
  } else {
    res.status(404);
    throw new Error('Material not found');
  }
});

// @desc    Create new review for a material
// @route   POST /api/materials/:id/reviews
// @access  Private
const createMaterialReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const material = await Material.findById(req.params.id);

  if (material) {
    // Ensure reviews array exists before pushing
    if (!material.reviews) {
      material.reviews = [];
    }
    const alreadyReviewed = material.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Material already reviewed');
    }
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };
    material.reviews.push(review);
    material.numReviews = material.reviews.length;
    material.rating =
      material.reviews.reduce((acc, item) => item.rating + acc, 0) / material.reviews.length;
    await material.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Material not found');
  }
});

module.exports = {
  getMaterials,
  getMaterialById,
  likeMaterial,
  createMaterialReview,
};