const express = require("express");
const router = express.Router();

const adminControl = require('../controllers/admin_control');

// Admin routers

router.get("/manage-payment", adminControl.showManagepayment);
router.get("/manage-employee", adminControl.showManageEmp);
router.get("/manage-service", adminControl.showManageService);
router.get("/manage-customer", adminControl.showManageCus);
router.get("/manage-stock", adminControl.showManageStock);
router.get("/stat", adminControl.showStat);


router.post("/manage-employee/update/:staff_id", adminControl.EditEmp);
router.post("/manage-customer/add", adminControl.CreateCus);
router.post("/manage-customer/update/:user_id", adminControl.EditCus);

router.post("/manage-stock/add", adminControl.Createproduct);
router.post("/manage-stock/update/:product_id", adminControl.Editproduct);
router.post("/manage-stock/delete/:product_id", adminControl.Deleteproduct);

module.exports = router;