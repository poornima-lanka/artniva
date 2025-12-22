const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // <-- ADDED: Needed for generating the token

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin'],
      default: 'customer',
    },
    isVerifiedSeller: { type: Boolean, default: false },
    // ADDED: Fields for password reset functionality
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Middleware to hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ADDED: Method to generate and hash the password reset token
userSchema.methods.getResetPasswordToken = function () {
  // 1. Generate a raw token (what we send in the email)
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 2. Hash the raw token and save the HASH to the database (Security measure)
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set the token expiration time (e.g., 15 minutes)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 

  // 4. Return the RAW token to be used in the email link
  return resetToken;
};


const User = mongoose.model('User', userSchema);

module.exports = User;