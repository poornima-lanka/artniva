// backend/routes/userRoutes.js
const express = require('express');
const {
    registerUser,
    loginUser, // <-- Corrected: Use loginUser here
    getUserProfile,
    updateUserProfile, // <-- Important for profile updates
    getAllUsers, // For admin to view all users
    deleteUser,  // For admin to delete users
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware'); // Ensure 'admin' is imported

const router = express.Router();

// Public routes (no authentication needed)
router.post('/register', registerUser); // <-- Corrected path: /register
router.post('/login', loginUser);       // <-- Corrected path: /login and controller: loginUser

// Protected routes (authentication needed)
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile); // <-- Added update profile route

// Admin-only routes (authentication + admin role needed)
router.route('/') // This applies to /api/users/
    .get(protect, admin, getAllUsers); // Get all users, admin only

router.route('/:id') // This applies to /api/users/:id
    .delete(protect, admin, deleteUser); // Delete user by ID, admin only

module.exports = router;