// backend/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // For protected routes
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

// All cart routes will be protected, meaning a user must be logged in to access their cart
router.route('/')
  .get(protect, getCart)         // Get user's cart
  .post(protect, addToCart)      // Add item to cart (or update quantity if exists)
  .delete(protect, clearCart);   // Clear user's entire cart

router.route('/:id') // ID here refers to the _id of the item in cartItems array (if needed for specific update/delete)
  .put(protect, updateCartItemQuantity) // Update quantity of a specific item in cart
  .delete(protect, removeCartItem);     // Remove a specific item from cart

module.exports = router;