const mongoose = require('mongoose');

// Define the commission rate as a constant here (20%)
const ADMIN_COMMISSION_RATE = 0.20; // 20%

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { // The user who wrote this review
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);


const productSchema = mongoose.Schema(
  {
    // Renamed 'user' to 'seller' for clarity in the marketplace context
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    // Assuming 'image' is a single string URL here, matching your existing structure
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
    // --- PRICE AND COMMISSION FIELDS ---
    price: {
      // This is the final price charged to the customer
      type: Number,
      required: true,
      default: 0,
    },
    sellerEarning: {
        // Amount the seller receives (Price - Commission)
        type: Number,
        default: 0.0,
        required: true,
    },
    commission: {
        // Amount the admin receives (Price * 0.20)
        type: Number,
        default: 0.0,
        required: true,
    },
    // --- END COMMISSION FIELDS ---
    
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    
    reviews: [reviewSchema],
    
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
    
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
  },
  {
    timestamps: true,
  }
);

// --- Mongoose Middleware (Pre-save Hook) to Calculate Commission ---
productSchema.pre('save', function(next) {
    // Only recalculate if the price has been modified
    if (this.isModified('price')) {
        const commissionAmount = this.price * ADMIN_COMMISSION_RATE;
        this.commission = commissionAmount;
        this.sellerEarning = this.price - commissionAmount;
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;


