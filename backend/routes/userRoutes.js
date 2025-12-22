const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAdminStats, // Imported correctly
    verifySeller,  // Imported correctly
    getAllUsers,
    deleteUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

// --- PROTECTED USER ROUTES ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- ADMIN ONLY ROUTES ---

// 1. DASHBOARD STATS (This was missing!)
// This is what fixes the "0" values on your dashboard
router.get('/stats', protect, admin, getAdminStats); 

// 2. SELLER VERIFICATION
// We use the function from your controller instead of writing it here again
router.put('/:id/verify', protect, admin, verifySeller);

// 3. USER MANAGEMENT (Get all or Delete)
router.route('/')
    .get(protect, admin, getAllUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser);

module.exports = router;