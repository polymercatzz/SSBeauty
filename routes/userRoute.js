const express = require("express");
const router = express.Router();

const userControl = require('../controllers/user_control');

// User routers

router.get("/home", userControl.showMainUser);

router.get("/hair", userControl.showHair);
router.get("/hair/booking/:service_id", userControl.showBookingHair);

router.post("/booking/:service_id", userControl.BookingService);

router.get("/spa", userControl.showSpa);
router.get("/spa/booking/:service_id", userControl.showBookingSpa);

router.get("/history", userControl.showHistory);
router.post("/history/:appointment_id/cancel", userControl.CancelAppointments);


module.exports = router;