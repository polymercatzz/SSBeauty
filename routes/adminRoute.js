const express = require("express");
const router = express.Router();

const adminControl = require('../controllers/admin_control');

// Admin routers

router.get("", adminControl.showMainAdmin);
router.get("/manage-employee", adminControl.showManageEmp);
router.get("/manage-customer", adminControl.showManageCus);
router.get("/manage-stock", adminControl.showManageStock);

module.exports = router;