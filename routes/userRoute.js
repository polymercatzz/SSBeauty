const express = require("express");
const router = express.Router();
const { verifyToken, isCustomer } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const userControl = require('../controllers/user_control');

// User routers - All routes require authentication
// Note: isCustomer also allows admin role to access these routes

router.get("/home", userControl.showMainUser);

router.get("/hair", verifyToken, userControl.showHair);
router.get("/hair/booking/:service_id", verifyToken, userControl.showBookingHair);

router.post("/booking/:service_id", verifyToken, userControl.BookingService);

router.get("/spa", verifyToken, userControl.showSpa);
router.get("/spa/booking/:service_id", verifyToken, userControl.showBookingSpa);

router.get("/history", verifyToken, userControl.showHistory);
router.post("/history/:appointment_id/cancel", verifyToken, userControl.CancelAppointments);

// Update user profile (name fields + profile image)
router.post('/profile', verifyToken, upload.single('profile_image'), userControl.updateProfile);


module.exports = router;