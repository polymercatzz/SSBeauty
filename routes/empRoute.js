const express = require("express");
const router = express.Router();

const empControl = require('../controllers/emp_control');
const { verifyToken, isEmployee } = require('../middleware/auth');

router.get("/home", verifyToken, isEmployee, empControl.showSchedule);
router.get("/all-schedule", verifyToken, isEmployee, empControl.showAllSchedule);
router.get("/stock", verifyToken, isEmployee, empControl.showStock);

router.post("/use/:product_id", verifyToken, isEmployee, empControl.useProduct);
router.post("/update-status/:appointment_id", verifyToken, isEmployee, empControl.updateAppointmentStatus);
router.post("/update-profile", verifyToken, isEmployee, empControl.updateProfile);


module.exports = router;