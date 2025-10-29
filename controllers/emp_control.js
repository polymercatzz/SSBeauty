const {   User,
  Employee,
  Service,
  Appointment,
  Product,
  ProductUsage } = require('../models');

const showSchedule = async (req, res) => {
    const employeeId = 1; // แก้ไขให้เป็นsessions
    const appointments = await Appointment.findAll({
        where: { employee_id: employeeId },
        include: [
            { model: User },
            { model: Service },
        ]
    });
    appointments.forEach(appointment => {
        if (appointment.status === 'booked') {
            appointment.showstatus = 'จองแล้ว';
        } else if (appointment.status === 'in_progress') {
            appointment.showstatus = 'กำลังดำเนินการ';
        } else if (appointment.status === 'completed') {
            appointment.showstatus = 'เสร็จสิ้น';
        } else if (appointment.status === 'canceled') {
            appointment.showstatus = 'ยกเลิก';
        }
    });
    res.render('emp_work_schedule', { appointments: appointments });
};

const showStock = async (req, res) => {
    const employeeId = 1; // แก้ไขให้เป็นsessions
    const products = await Product.findAll({});
    const employee = await Employee.findByPk(employeeId, {
        include: { model: User}
    });
    res.render('emp_product_pickup', { products: products, employee: employee});
};

const useProduct = async (req, res) => {
    const employeeId = 1; // แก้ไขให้เป็นsessions
    const { product_id } = req.params;
    const quantityInt = parseInt(req.body.quantity);
    // ตรวจสอบว่ามีสินค้านี้ในสต็อกหรือไม่
    const product = await Product.findByPk(product_id);
    if (!product) {
        return res.send('Product not found');
    }
    if (product.stock < quantityInt) {
        return res.send('Insufficient stock');
    }
    // บันทึกการใช้ผลิตภัณฑ์
    await ProductUsage.create({
        employee_id: employeeId,
        product_id: product_id,
        qty: quantityInt
    });
    // อัปเดตสต็อกสินค้า
    product.stock_qty -= quantityInt;
    await product.save();
    res.redirect('/employee/stock');
};
module.exports = { showSchedule, showStock, useProduct};