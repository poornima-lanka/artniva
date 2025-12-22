const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../config/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/users/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalCustomers = await User.countDocuments({ 
        role: { $in: ['customer', 'buyer'] } 
    });
    const verifiedSellers = await User.countDocuments({ role: 'seller', isVerifiedSeller: true });
    const pendingSellers = await User.countDocuments({ role: 'seller', isVerifiedSeller: false });

    res.json({
        totalSellers,
        totalCustomers,
        verifiedSellers,
        pendingSellers
    });
});

// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'customer',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token (THIS WAS MISSING)
// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get all users (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Verify a Seller (Admin only)
const verifySeller = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user && user.role === 'seller') {
        user.isVerifiedSeller = true;
        await user.save();
        res.json({ message: 'Seller verified successfully' });
    } else {
        res.status(404);
        throw new Error('Seller not found');
    }
});

// @desc    Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update profile placeholder
const updateUserProfile = asyncHandler(async (req, res) => {
    res.json({ message: "Update profile feature coming soon" });
});

// @desc    Delete user
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- PASSWORD RESET LOGIC ---

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;
    const message = `You requested a password reset. Please click: \n\n ${resetUrl}`;

    try {
        await sendEmail({ email: user.email, subject: 'Password Reset', message });
        res.status(200).json({ success: true, message: 'Email sent' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
});

// FINAL EXPORT
module.exports = {
    getAdminStats,
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser,
    verifySeller,
    forgotPassword,
    resetPassword,
};