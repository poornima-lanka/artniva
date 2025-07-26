// backend/models/Cart.js
const mongoose = require('mongoose');

// Schema for individual items within the cart
const cartItemSchema = mongoose.Schema({
  // We need to reference the product being added (Material or Artwork)
  // A generic 'product' field that can refer to either Material or Artwork
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType' // This tells Mongoose which model to reference dynamically
  },
  itemType: { // To differentiate between Material and Artwork
    type: String,
    required: true,
    enum: ['Material', 'Product'] // 'Product' for artworks, 'Material' for materials
  },
  name: { // Store name for convenience (denormalization)
    type: String,
    required: true
  },
  imageUrl: { // Store imageUrl for convenience
    type: String
  },
  price: { // Store price for convenience (price at time of adding)
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
}, {
  _id: false // cart items don't need their own _id as they are subdocuments
});

// Schema for the main Cart document
const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Reference to the User model
    unique: true // A user can only have one cart
  },
  cartItems: [cartItemSchema], // Array of cartItemSchema as subdocuments
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;