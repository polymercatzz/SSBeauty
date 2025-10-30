const express = require("express");
const router = express.Router();

const empControl = require('../controllers/emp_control');

router.get("/home", empControl.showSchedule);
router.get("/all-schedule", empControl.showAllSchedule);
router.get("/stock", empControl.showStock);

router.post("/use/:product_id", empControl.useProduct);
router.post("/update-status/:appointment_id", empControl.updateAppointmentStatus);
router.post("/update-profile", empControl.updateProfile);


module.exports = router;