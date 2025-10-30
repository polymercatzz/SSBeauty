const express = require("express");
const router = express.Router();

const adminControl = require('../controllers/admin_control');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Protect all admin routes: require authenticated admin user
router.use(verifyToken, isAdmin);

// Admin routers
router.get("/manage-payment", adminControl.showManagepayment);
router.get("/manage-employee", adminControl.showManageEmp);
router.get("/manage-service", adminControl.showManageService);
router.get("/manage-customer", adminControl.showManageCus);
router.get("/manage-stock", adminControl.showManageStock);
router.get("/stat", adminControl.showStat);


router.post("/manage-payment/:appointment_id", adminControl.updatePaymentStatus);
router.post("/manage-customer/cancel-appointment/:appointment_id", adminControl.CancelAppointment);
router.post("/manage-employee/create", adminControl.CreateEmp);
router.post("/manage-employee/update/:employee_id", adminControl.EditEmp);
router.post("/manage-service/create", adminControl.upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
]), adminControl.CreateService);
router.post("/manage-service/update/:service_id", adminControl.upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
]), adminControl.EditService);
router.post("/manage-service/delete/:service_id", adminControl.DeleteService);
router.post("/manage-customer/add", adminControl.CreateCus);
router.post("/manage-customer/update/:user_id", adminControl.EditCus);
router.post("/manage-customer/suspend/:user_id", adminControl.ToggleSuspendCus);

router.post("/manage-stock/add", adminControl.upload.single('image'), adminControl.Createproduct);
router.post("/manage-stock/update/:product_id", adminControl.upload.single('image'), adminControl.Editproduct);
router.post("/manage-stock/delete/:product_id", adminControl.Deleteproduct);


module.exports = router;