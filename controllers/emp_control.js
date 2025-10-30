const {   User,
  Employee,
  Service,
  Appointment,
  Product,
  ProductUsage } = require('../models');

const { getSignedUrl } = require('../src/services/s3Service');

const showSchedule = async (req, res) => {
    const employeeId = 1; // แก้ไขให้เป็นsessions
    
    // Get employee details with services
    const employee = await Employee.findByPk(employeeId, {
        include: [
            { model: User },
            { model: Service }
        ]
    });
    
    // Get all available services for the profile form
    const allServices = await Service.findAll({
        order: [['name', 'ASC']]
    });
    
    // Get today's date range (start and end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get appointments for today only
    const appointments = await Appointment.findAll({
        where: { 
            employee_id: employeeId,
            appointment_date: {
                [require('sequelize').Op.gte]: today,
                [require('sequelize').Op.lt]: tomorrow
            }
        },
        include: [
            { model: User },
            { model: Service },
        ],
        order: [['appointment_date', 'ASC']]
    });
    
    // Calculate income and add status text
    let totalIncome = 0;
    appointments.forEach(appointment => {
        // Set status display text
        if (appointment.status === 'booked') {
            appointment.showstatus = 'จองแล้ว';
        } else if (appointment.status === 'in_progress') {
            appointment.showstatus = 'กำลังดำเนินการ';
        } else if (appointment.status === 'completed') {
            appointment.showstatus = 'เสร็จสิ้น';
        } else if (appointment.status === 'canceled') {
            appointment.showstatus = 'ยกเลิก';
        }
        
        // Calculate employee income from completed appointments
        if (appointment.status === 'completed' && appointment.Service) {
            const servicePrice = parseFloat(appointment.Service.price) || 0;
            const commissionRate = parseFloat(employee.commission_rate) || 0;
            const employeeEarning = servicePrice * (commissionRate / 100);
            appointment.employeeIncome = employeeEarning;
            totalIncome += employeeEarning;
        } else {
            appointment.employeeIncome = 0;
        }
    });
    
    res.render('emp_work_schedule', { 
        appointments: appointments,
        employee: employee,
        totalIncome: totalIncome,
        allServices: allServices
    });
};

const showStock = async (req, res) => {
    const employeeId = 1; // แก้ไขให้เป็นsessions
    
    // Get all products
    const products = await Product.findAll({
        order: [['name', 'ASC']]
    });
    
    // Generate signed URLs for product images
    const productsWithUrls = await Promise.all(products.map(async (product) => {
        const productData = product.toJSON();
        if (productData.image_url) {
            productData.imageSignedUrl = await getSignedUrl(productData.image_url);
        }
        return productData;
    }));
    
    // Get employee details with services
    const employee = await Employee.findByPk(employeeId, {
        include: [
            { model: User },
            { model: Service }
        ]
    });
    
    // Get all available services for the profile form
    const allServices = await Service.findAll({
        order: [['name', 'ASC']]
    });
    
    res.render('emp_product_pickup', { 
        products: productsWithUrls, 
        employee: employee,
        allServices: allServices
    });
};

const useProduct = async (req, res) => {
    try {
        const employeeId = 1; // แก้ไขให้เป็นsessions
        const { product_id } = req.params;
        const { quantity } = req.body;
        const quantityInt = parseInt(quantity);
        
        // Validate quantity
        if (!quantityInt || quantityInt <= 0) {
            return res.status(400).send('Invalid quantity');
        }
        
        // Check if product exists
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        // Check stock availability
        if (product.stock_qty < quantityInt) {
            return res.status(400).send(`Insufficient stock. Available: ${product.stock_qty} ${product.unit}`);
        }
        
        // Record product usage
        await ProductUsage.create({
            employee_id: employeeId,
            product_id: product_id,
            qty: quantityInt
        });
        
        // Update product stock
        product.stock_qty -= quantityInt;
        await product.save();
        
        res.redirect('/employee/stock');
    } catch (error) {
        console.error('Error using product:', error);
        res.status(500).send('Error processing product usage');
    }
};

const showAllSchedule = async (req, res) => {
    const employeeId = 1; // แก้ไขให้เป็นsessions
    
    // Get employee details with services
    const employee = await Employee.findByPk(employeeId, {
        include: [
            { model: User },
            { model: Service }
        ]
    });
    
    // Get all available services for the profile form
    const allServices = await Service.findAll({
        order: [['name', 'ASC']]
    });
    
    // Get all appointments for this employee (not just today)
    const appointments = await Appointment.findAll({
        where: { employee_id: employeeId },
        include: [
            { model: User },
            { model: Service },
        ],
        order: [['appointment_date', 'DESC']]
    });
    
    // Calculate income and add status text
    let totalIncome = 0;
    appointments.forEach(appointment => {
        // Set status display text
        if (appointment.status === 'booked') {
            appointment.showstatus = 'จองแล้ว';
        } else if (appointment.status === 'in_progress') {
            appointment.showstatus = 'กำลังดำเนินการ';
        } else if (appointment.status === 'completed') {
            appointment.showstatus = 'เสร็จสิ้น';
        } else if (appointment.status === 'canceled') {
            appointment.showstatus = 'ยกเลิก';
        }
        
        // Calculate employee income from completed appointments
        if (appointment.status === 'completed' && appointment.Service) {
            const servicePrice = parseFloat(appointment.Service.price) || 0;
            const commissionRate = parseFloat(employee.commission_rate) || 0;
            const employeeEarning = servicePrice * (commissionRate / 100);
            appointment.employeeIncome = employeeEarning;
            totalIncome += employeeEarning;
        } else {
            appointment.employeeIncome = 0;
        }
    });
    
    res.render('emp_all_schedule', { 
        appointments: appointments,
        employee: employee,
        totalIncome: totalIncome,
        allServices: allServices
    });
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { status } = req.body;
        
        // Update appointment status
        await Appointment.update(
            { status: status },
            { where: { appointment_id: appointment_id } }
        );
        
        // Redirect back to the page
        const referer = req.get('Referer') || '/employee/home';
        res.redirect(referer);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.redirect('/employee/home');
    }
};

const updateProfile = async (req, res) => {
    try {
        const employeeId = 1; // แก้ไขให้เป็นsessions
        const { first_name, last_name, nickname, phone, email, bio, service_ids, skills } = req.body;
        
        // Get employee with user
        const employee = await Employee.findByPk(employeeId, {
            include: { model: User }
        });
        
        if (!employee) {
            return res.status(404).send('Employee not found');
        }
        
        // Update user information
        await User.update({
            first_name: first_name,
            last_name: last_name,
            nickname: nickname,
            phone: phone,
            email: email
        }, {
            where: { user_id: employee.user_id }
        });
        
        // Convert skills array to JSON string for storage
        const skillsString = skills ? JSON.stringify(Array.isArray(skills) ? skills : [skills]) : null;
        
        // Update employee bio and skills
        await Employee.update({
            bio: bio,
            skills: skillsString
        }, {
            where: { employee_id: employeeId }
        });
        
        // Update employee services (M-M relationship)
        if (service_ids) {
            const serviceIdsArray = Array.isArray(service_ids) ? service_ids : [service_ids];
            await employee.setServices(serviceIdsArray);
        } else {
            // Clear all services if none selected
            await employee.setServices([]);
        }
        
        // Redirect back to the previous page
        const referer = req.get('Referer') || '/employee/home';
        res.redirect(referer);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Error updating profile');
    }
};

module.exports = { showSchedule, showAllSchedule, showStock, useProduct, updateAppointmentStatus, updateProfile};