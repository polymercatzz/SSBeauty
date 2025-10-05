const express = require("express");
const router = express.Router();

const userControl = require('../controllers/user_control');

// User routers

router.get("/home", userControl.showMainUser);

router.get("/hair", userControl.showHair);
router.get("/hair/booking/:service_id", userControl.showBookingHair);

router.get("/spa", userControl.showSpa);
router.get("/spa/booking/:serviec_id", userControl.showBookingSpa);

router.get("/history", userControl.showHistory);


module.exports = router;