const { use } = require("../routes/adminRoute");

const showMainAdmin = (req, res) => {
    res.render("admin_manage_payment");
}

const showManageEmp = (req, res) => {
    res.render("admin_emp_management");
}

const showManageCus = (req, res) => {
    res.render("admin_cus_management");
}

const showManageStock = (req, res) => {
    res.render("admin_stock_management");
}


module.exports = { showMainAdmin , showManageEmp, showManageCus, showManageStock};