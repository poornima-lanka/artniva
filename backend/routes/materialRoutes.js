// backend/routes/materialRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Material = require('../models/Material');
const { protect } = require('../middleware/authMiddleware');
const {
  getMaterials,
  getMaterialById,
  likeMaterial,
  createMaterialReview,
} = require('../controllers/materialController');

// --- Material Routes ---

// @route GET /api/materials
// @desc  Fetch all art materials
router.route('/').get(getMaterials);

// @route POST /api/materials/:id/reviews
// @desc  Create a new review for an art material
// @access Private
router.route('/:id/reviews').post(protect, createMaterialReview);

// @route POST /api/materials/:id/like
// @desc  Toggle like status for a material
// @access Private
router.route('/:id/like').post(protect, likeMaterial);

// @route GET /api/materials/:id
// @desc  Fetch a single art material by ID
router.route('/:id').get(getMaterialById);

module.exports = router;