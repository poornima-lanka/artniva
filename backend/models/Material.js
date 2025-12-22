const mongoose = require('mongoose');

// The review schema - (Mee code, emi marchaledhu)
const reviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  // FIX 1: "seller" field add chesthunnanu (Lekapothe "My Inventory" lo items kanipinchaavu)
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  
  brand: { type: String },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  countInStock: { type: Number, required: true, default: 0 },

  // FIX 2: "imageUrl" ni "image" ga marchanu (Mee controller/dashboard lo ide name undi)
  image: { type: String, required: true }, 

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  reviews: [reviewSchema],
  numReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;