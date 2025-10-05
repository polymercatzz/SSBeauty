
const {   User,
  Staff,
  Service,
  StaffService,
  Appointment,
  Product } = require('../models');


const showManagepayment = async (req, res) => {
    const appointments = await Appointment.findAll({
        include: [ User, Staff, Service ]
        }
    );

    res.render("admin_manage_payment", { appointments: appointments});
};

const showManageEmp = async (req, res) => {
    const staffs = await Staff.findAll(
        {
            include: [ User ]
        }
    );
    res.render("admin_emp_management", { staffs: staffs });
};

const EditEmp = async (req, res) => {
    const staffId = req.params.staff_id;
    const { position, schedule, salary, commission_rate} = req.body;
    await Staff.update(
        { position, schedule, salary, commission_rate },
        { where: { staff_id: staffId } }
    );
    res.redirect("/admin/manage-employee");
};


const showManageService = async (req, res) => {
    const services = await StaffService.findAll({
        include: [ Staff, Service ]
    });
    res.json(services);
};

const showManageCus = async (req, res) => {
    const users = await User.findAll(
        {
            where: { role: 'customer' }
        }
    );
    res.render("admin_cus_management", { users: users });
};
const CreateCus = async (req, res) => {
    const { first_name, last_name, email, phone_number, password } = req.body;
    await User.create({ first_name, last_name, email, phone_number, password, role: 'customer' });
    res.redirect("/admin/manage-customer");
};

const EditCus = async (req, res) => {
    const userId = req.params.user_id;
    const { first_name, last_name, email, phone_number, role } = req.body;
    if (role && role == 'employee') {
        await Staff.create({ user_id: userId, position: '', schedule: '', salary: 0, commission_rate: 0 });
        await User.update({ role: 'employee' }, { where: { user_id: userId } });
        return res.redirect("/admin/manage-customer");
    }
    await User.update(
        { first_name, last_name, email, phone_number },
        { where: { user_id: userId } }
    );
    res.redirect("/admin/manage-customer");
};

const showManageStock = (req, res) => {
    const products = Product.findAll();
    res.render("admin_stock_management", { products: products });
};

const Createproduct = (req, res) => {
    const { product_name, quantity, price, unit } = req.body;
    Product.create({ product_name, quantity, price, unit });
    res.redirect("/admin/manage-stock");
};

const Editproduct = (req, res) => {
    const productId = req.params.product_id;
    const { product_name, quantity, price, unit } = req.body;
    Product.update(
        { product_name, quantity, price, unit },
        { where: { product_id: productId } }
    );
    res.redirect("/admin/manage-stock");
};

const Deleteproduct = (req, res) => {
    const productId = req.params.product_id;
    Product.destroy({ where: { product_id: productId } });
    res.redirect("/admin/manage-stock");
};


module.exports = { showManagepayment , showManageEmp, showManageService, showManageCus, showManageStock, EditEmp, CreateCus, EditCus, Createproduct, Editproduct, Deleteproduct };