// routes/authRoute.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_control');
const { verifyToken } = require('../middleware/auth');

// Show login/register page
router.get('/login', authController.showLoginPage);

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Get current user (protected route)
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
