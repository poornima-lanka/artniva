// backend/models/Product.js
const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // The name of the user who wrote the review
    rating: { type: Number, required: true }, // The star rating (e.g., 4.5)
    comment: { type: String, required: true }, // The actual text comment
    user: { // Which user ID wrote this review
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This links it to your User model
    },
  },
  {
    timestamps: true, // Automatically adds creation and update dates for each review
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    // --- ADDED: REVIEWS ARRAY HERE ---
    reviews: [reviewSchema],
    // --- END ADDITION ---
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    // --- ADDED: LIKES ARRAY HERE ---
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // --- END ADDITION ---
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
