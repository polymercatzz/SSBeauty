const express = require("express");
const router = express.Router();

const userControl = require('../controllers/user_control');

// User routers

router.get("/:username", userControl.showMainUser);

module.exports = router;