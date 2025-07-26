// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin, seller } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  createProductReview,
  likeProduct,
  getLikedProducts,
} = require('../controllers/productController');

// --- Product Routes ---
router.route('/').get(getProducts);
router.route('/').post(protect, seller, createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, seller, updateProduct)
  .delete(protect, seller, deleteProduct);
router.route('/myproducts').get(protect, seller, getSellerProducts);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/like').post(protect, likeProduct);
router.route('/liked').get(protect, getLikedProducts);

module.exports = router;