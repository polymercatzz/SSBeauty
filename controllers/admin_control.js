
const { where } = require('sequelize');

const multer = require('multer');
const { uploadFile, getSignedUrl } = require('../src/services/s3Service');

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const {   User,
  Employee,
  Service,
  EmployeeService,
  Appointment,
  Product } = require('../models');


const showManagepayment = async (req, res) => {
    const appointments = await Appointment.findAll({
        include: [ User, Employee, Service ],
        where: { status: 'in_progress' }
    });
    res.render("admin_manage_payment", { appointments: appointments });
};

const updatePaymentStatus = async (req, res) => {
    const appointmentId = req.params.appointment_id;
    const { status } = req.body;

    await Appointment.update({ status }, { where: { appointment_id: appointmentId } });
    res.redirect("/admin/manage-payment");
};

const CancelAppointment = async (req, res) => {
    const appointmentId = req.params.appointment_id;
    await Appointment.update({ status: 'canceled' }, { where: { appointment_id: appointmentId } });
    res.redirect("/admin/manage-customer");
};

const showManageEmp = async (req, res) => {
    const employees = await Employee.findAll(
        {
            include: [ User ]
        }
    );
    res.render("admin_emp_management", { employees: employees });
};

const EditEmp = async (req, res) => {
    const employeeId = req.params.employee_id;
    const { position, bio, role, salary, commission_rate, user_id } = req.body;
    
    // Handle schedule - convert array to comma-separated string
    const schedule = req.body.schedule ? req.body.schedule.join(', ') : '';
    
    try {
        // Update Employee table
        await Employee.update(
            { 
                position: position || '', 
                bio: bio || '',
                schedule: schedule,
                salary: salary || 0, 
                commission_rate: commission_rate || 0 
            },
            { where: { employee_id: employeeId } }
        );
        
        // Update User role if provided
        if (role && user_id) {
            await User.update(
                { role: role },
                { where: { user_id: user_id } }
            );
        }
        
        res.redirect("/admin/manage-employee");
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).send('Error updating employee');
    }
};

const CreateEmp = async (req, res) => {
    const { 
        first_name, 
        last_name, 
        nickname, 
        phone, 
        email, 
        password, 
        role, 
        position, 
        bio, 
        salary, 
        commission_rate 
    } = req.body;
    
    // Handle schedule - convert array to comma-separated string
    const schedule = req.body.schedule ? req.body.schedule.join(', ') : '';
    
    try {
        // Create User first
        const newUser = await User.create({
            first_name: first_name,
            last_name: last_name,
            nickname: nickname || null,
            phone: phone || null,
            email: email,
            password: password, // In production, hash this password!
            role: role || 'staff'
        });
        
        // Create Employee record
        await Employee.create({
            user_id: newUser.user_id,
            position: position || '',
            bio: bio || '',
            schedule: schedule,
            salary: salary || 0,
            commission_rate: commission_rate || 0
        });
        
        res.redirect("/admin/manage-employee");
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).send('Error creating employee: ' + error.message);
    }
};


const showManageService = async (req, res) => {
    try {
        const services = await Service.findAll({
            include: [{
                model: Employee,
                through: { attributes: [] },
                include: [{ model: User }]
            }],
            order: [['service_id', 'DESC']]
        });

        // Generate signed URLs for images
        const servicesWithImages = await Promise.all(services.map(async (service) => {
            const serviceData = service.toJSON();
            if (serviceData.image1) {
                serviceData.image1Url = await getSignedUrl(serviceData.image1);
            }
            if (serviceData.image2) {
                serviceData.image2Url = await getSignedUrl(serviceData.image2);
            }
            if (serviceData.image3) {
                serviceData.image3Url = await getSignedUrl(serviceData.image3);
            }
            return serviceData;
        }));

        const employees = await Employee.findAll({
            include: [{ model: User }]
        });

        res.render('admin_service', { 
            servicesData: servicesWithImages,
            employeesData: employees
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.render('admin_service', { 
            servicesData: [],
            employeesData: []
        });
    }
};

const CreateService = async (req, res) => {
    try {
        const { name, type, description, price, duration, employee_ids } = req.body;
        const files = req.files || {};

        console.log('Creating service with files:', files);

        // Upload images to S3
        let image1 = null, image2 = null, image3 = null;
        
        if (files.image1 && files.image1[0]) {
            console.log('Uploading image1...');
            const fileName = `services/${Date.now()}-${files.image1[0].originalname}`;
            image1 = await uploadFile(files.image1[0].buffer, fileName, files.image1[0].mimetype);
        }
        if (files.image2 && files.image2[0]) {
            console.log('Uploading image2...');
            const fileName = `services/${Date.now()}-${files.image2[0].originalname}`;
            image2 = await uploadFile(files.image2[0].buffer, fileName, files.image2[0].mimetype);
        }
        if (files.image3 && files.image3[0]) {
            console.log('Uploading image3...');
            const fileName = `services/${Date.now()}-${files.image3[0].originalname}`;
            image3 = await uploadFile(files.image3[0].buffer, fileName, files.image3[0].mimetype);
        }

        console.log('Image keys:', { image1, image2, image3 });

        // Create service
        const service = await Service.create({
            name,
            type,
            description,
            price: parseFloat(price),
            duration: parseInt(duration),
            image1,
            image2,
            image3
        });

        console.log('Service created:', service.service_id);

        // Add employee associations
        if (employee_ids && employee_ids.length > 0) {
            const employeeIdsArray = Array.isArray(employee_ids) ? employee_ids : [employee_ids];
            const associations = employeeIdsArray.map(emp_id => ({
                service_id: service.service_id,
                employee_id: parseInt(emp_id)
            }));
            await EmployeeService.bulkCreate(associations);
            console.log('Employee associations created');
        }

        res.redirect('/admin/manage-service');
    } catch (error) {
        console.error('Error creating service:', error);
        res.redirect('/admin/manage-service');
    }
};

const EditService = async (req, res) => {
    try {
        const { service_id, name, type, description, price, duration, employee_ids } = req.body;
        const files = req.files || {};

        // Get existing service
        const existingService = await Service.findByPk(service_id);
        
        // Upload new images or keep existing ones
        let image1 = existingService.image1;
        let image2 = existingService.image2;
        let image3 = existingService.image3;
        
        if (files.image1 && files.image1[0]) {
            const fileName = `services/${Date.now()}-${files.image1[0].originalname}`;
            image1 = await uploadFile(files.image1[0].buffer, fileName, files.image1[0].mimetype);
        }
        if (files.image2 && files.image2[0]) {
            const fileName = `services/${Date.now()}-${files.image2[0].originalname}`;
            image2 = await uploadFile(files.image2[0].buffer, fileName, files.image2[0].mimetype);
        }
        if (files.image3 && files.image3[0]) {
            const fileName = `services/${Date.now()}-${files.image3[0].originalname}`;
            image3 = await uploadFile(files.image3[0].buffer, fileName, files.image3[0].mimetype);
        }

        // Update service
        await Service.update({
            name,
            type,
            description,
            price: parseFloat(price),
            duration: parseInt(duration),
            image1,
            image2,
            image3
        }, {
            where: { service_id }
        });

        // Update employee associations
        await EmployeeService.destroy({ where: { service_id } });
        if (employee_ids && employee_ids.length > 0) {
            const employeeIdsArray = Array.isArray(employee_ids) ? employee_ids : [employee_ids];
            const associations = employeeIdsArray.map(emp_id => ({
                service_id: parseInt(service_id),
                employee_id: parseInt(emp_id)
            }));
            await EmployeeService.bulkCreate(associations);
        }

        res.redirect('/admin/manage-service');
    } catch (error) {
        console.error('Error editing service:', error);
        res.redirect('/admin/manage-service');
    }
};

const DeleteService = async (req, res) => {
    try {
        const service_id = req.params.service_id || req.body.service_id;

        // Delete employee associations first
        await EmployeeService.destroy({ where: { service_id } });
        
        // Delete service
        await Service.destroy({ where: { service_id } });

        res.redirect('/admin/manage-service');
    } catch (error) {
        console.error('Error deleting service:', error);
        res.redirect('/admin/manage-service');
    }
};

const showManageCus = async (req, res) => {
    const users = await User.findAll({
        where: { role: 'customer' },
        include: [{
            model: Appointment,
            include: [
                Service, 
                { 
                    model: Employee,
                    include: [User]
                }
            ]
        }],
        order: [['user_id', 'DESC']]
    });
    
    // Format customer data with appointment history
    const customersData = users.map(user => ({
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        is_suspended: user.is_suspended,
        appointments: user.Appointments ? user.Appointments.map(apt => ({
            appointment_id: apt.appointment_id,
            appointment_date: apt.appointment_date,
            status: apt.status,
            service_name: apt.Service ? apt.Service.name : '',
            price: apt.Service ? apt.Service.price : 0,
            employee_name: apt.Employee && apt.Employee.User ? `${apt.Employee.User.first_name} ${apt.Employee.User.last_name}` : ''
        })).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)) : []
    }));
    res.render("admin_cus_management", { customers: customersData });
};
const CreateCus = async (req, res) => {
    const { first_name, last_name, nickname, email, phone, password } = req.body;
    await User.create({ first_name, last_name, nickname, email, phone, password, role: 'customer', is_suspended: false });
    res.redirect("/admin/manage-customer");
};

const EditCus = async (req, res) => {
    const userId = req.params.user_id;
    const { first_name, last_name, nickname, email, phone, role } = req.body;
    if (role && role == 'employee') {
        await Employee.create({ user_id: userId, position: '', schedule: '', salary: 0, commission_rate: 0 });
        await User.update({ role: 'employee' }, { where: { user_id: userId } });
        return res.redirect("/admin/manage-customer");
    }
    await User.update(
        { first_name, last_name, nickname, email, phone },
        { where: { user_id: userId } }
    );
    res.redirect("/admin/manage-customer");
};

const ToggleSuspendCus = async (req, res) => {
    const userId = req.params.user_id;
    const user = await User.findByPk(userId);
    if (user) {
        await User.update(
            { is_suspended: !user.is_suspended },
            { where: { user_id: userId } }
        );
    }
    res.redirect("/admin/manage-customer");
};

const showManageStock = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['product_id', 'DESC']]
        });
        
        // Generate signed URLs for product images
        const productsWithSignedUrls = products.map(product => {
            const productData = product.toJSON();
            
            // If image_url exists, generate a signed URL for it
            if (productData.image_url) {
                productData.image_url = getSignedUrl(productData.image_url);
            }
            
            return productData;
        });
        
        res.render("admin_stock_management", { products: productsWithSignedUrls });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.render("admin_stock_management", { products: [] });
    }
};

const Createproduct = async (req, res) => {
    try {
        const { name, price, stock_qty, unit } = req.body;
        let image_url = null;

        // Handle image upload to S3
        if (req.file) {
            const fileName = `product/${Date.now()}-${req.file.originalname}`;
            image_url = await uploadFile(req.file.buffer, fileName, req.file.mimetype);
        }

        await Product.create({ 
            name, 
            price: parseFloat(price), 
            stock_qty: parseInt(stock_qty), 
            unit,
            image_url 
        });
        
        res.redirect("/admin/manage-stock");
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('Error creating product');
    }
};

const Editproduct = async (req, res) => {
    try {
        const productId = req.params.product_id;
        const { name, price, stock_qty, unit } = req.body;
        
        const updateData = { 
            name, 
            price: parseFloat(price), 
            stock_qty: parseInt(stock_qty), 
            unit 
        };

        // Handle image upload to S3 if new image is provided
        if (req.file) {
            const fileName = `product/${Date.now()}-${req.file.originalname}`;
            updateData.image_url = await uploadFile(req.file.buffer, fileName, req.file.mimetype);
        }

        await Product.update(updateData, { where: { product_id: productId } });
        res.redirect("/admin/manage-stock");
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
};

const Deleteproduct = async (req, res) => {
    const productId = req.params.product_id;
    await Product.destroy({ where: { product_id: productId } });
    res.redirect("/admin/manage-stock");
};

const showStat = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const sequelize = require('../models').sequelize;
        
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Get this month's date range
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        
        // 1. Count customers who used service today (completed appointments)
        const todayCustomers = await Appointment.count({
            where: {
                appointment_date: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                },
                status: 'completed'
            },
            distinct: true,
            col: 'user_id'
        });
        
        // 2. Calculate today's revenue (completed appointments)
        const todayRevenue = await Appointment.findAll({
            where: {
                appointment_date: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                },
                status: 'completed'
            },
            include: [Service]
        });
        const todayTotal = todayRevenue.reduce((sum, apt) => sum + (apt.Service?.price || 0), 0);
        
        // 3. Calculate this month's revenue
        const monthRevenue = await Appointment.findAll({
            where: {
                appointment_date: {
                    [Op.gte]: startOfMonth,
                    [Op.lt]: startOfNextMonth
                },
                status: 'completed'
            },
            include: [Service]
        });
        const monthTotal = monthRevenue.reduce((sum, apt) => sum + (apt.Service?.price || 0), 0);
        
        // 4. Get products with low stock
        const lowStockProducts = await Product.findAll({
            where: {
                stock_qty: {
                    [Op.lte]: 10
                }
            },
            order: [['stock_qty', 'ASC']],
            limit: 10
        });
        
        // 5. Daily revenue for last 7 days
        const dailyRevenue = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(today);
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            
            const dayAppointments = await Appointment.findAll({
                where: {
                    appointment_date: {
                        [Op.gte]: dayStart,
                        [Op.lt]: dayEnd
                    },
                    status: 'completed'
                },
                include: [Service]
            });
            
            const dayTotal = dayAppointments.reduce((sum, apt) => sum + (apt.Service?.price || 0), 0);
            dailyRevenue.push({
                date: dayStart.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
                revenue: dayTotal
            });
        }
        
        // 6. Monthly revenue for last 9 months
        const monthlyRevenue = [];
        for (let i = 8; i >= 0; i--) {
            const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
            
            const monthAppointments = await Appointment.findAll({
                where: {
                    appointment_date: {
                        [Op.gte]: monthStart,
                        [Op.lt]: monthEnd
                    },
                    status: 'completed'
                },
                include: [Service]
            });
            
            const monthRev = monthAppointments.reduce((sum, apt) => sum + (apt.Service?.price || 0), 0);
            monthlyRevenue.push({
                month: monthStart.toLocaleDateString('th-TH', { month: 'short' }),
                revenue: monthRev
            });
        }
        
        // 7. Monthly profit data for last 6 months (revenue, cost estimate, profit)
        const monthlyProfit = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
            
            const monthAppointments = await Appointment.findAll({
                where: {
                    appointment_date: {
                        [Op.gte]: monthStart,
                        [Op.lt]: monthEnd
                    },
                    status: 'completed'
                },
                include: [Service]
            });
            
            const revenue = monthAppointments.reduce((sum, apt) => sum + (apt.Service?.price || 0), 0);
            const cost = revenue * 0.45; // Estimate 45% cost
            const profit = revenue * 0.55; // 55% profit margin
            
            monthlyProfit.push({
                month: monthStart.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
                revenue: Math.round(revenue),
                cost: Math.round(cost),
                profit: Math.round(profit)
            });
        }
        
        // Calculate net profit (55% of monthly revenue as estimate)
        const netProfit = Math.round(monthTotal * 0.55);
        
        res.render("admin_stat", {
            todayCustomers,
            todayRevenue: Math.round(todayTotal),
            monthRevenue: Math.round(monthTotal),
            netProfit,
            lowStockProducts,
            dailyRevenue,
            monthlyRevenue,
            monthlyProfit
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.render("admin_stat", {
            todayCustomers: 0,
            todayRevenue: 0,
            monthRevenue: 0,
            netProfit: 0,
            lowStockProducts: [],
            dailyRevenue: [],
            monthlyRevenue: [],
            monthlyProfit: []
        });
    }
}


module.exports = { 
    showManagepayment, 
    updatePaymentStatus, 
    CancelAppointment, 
    showManageEmp, 
    CreateEmp, 
    EditEmp, 
    showManageService, 
    CreateService,
    EditService,
    DeleteService,
    showManageCus, 
    showManageStock, 
    CreateCus, 
    EditCus, 
    ToggleSuspendCus, 
    Createproduct, 
    Editproduct, 
    Deleteproduct, 
    showStat,
    upload // Export multer upload middleware
};