const express = require("express");
const router = express.Router();

const empControl = require('../controllers/emp_control');

router.get("/home", empControl.showSchedule);
router.get("/stock", empControl.showStock);

router.post("/use/:product_id", empControl.useProduct);


module.exports = router;