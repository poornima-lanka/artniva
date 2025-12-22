const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// IMPORT ALL FUNCTIONS (Make sure createMaterial is here!)
const {
    getMaterials,
    getMaterialById,
    likeMaterial,
    createMaterialReview,
    createMaterial 
} = require('../controllers/materialController');

// 1. Root Routes
router.route('/')
    .get(getMaterials)
    .post(protect, upload.single('image'), createMaterial);

// 2. Review Route
router.route('/:id/reviews').post(protect, createMaterialReview);

// 3. Like Route
router.route('/:id/like').post(protect, likeMaterial);

// 4. Single Item Route
router.route('/:id').get(getMaterialById);

module.exports = router;