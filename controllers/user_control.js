const sequelize = require('sequelize');
const {   User,
  Employee,
  Service,
  Appointment,
  Product } = require('../models');
const { uploadFile, getSignedUrl } = require('../src/services/s3Service');
const path = require('path');

const showMainUser = async (req, res) => {
    try {
        // Fetch all services
        const services = await Service.findAll({
            order: [['service_id', 'DESC']],
            limit: 12 // Show latest 12 services
        });

        // Fetch employees with their user details (include profile_image)
        const employees = await Employee.findAll({
            include: [{
                model: User,
                attributes: ['first_name', 'last_name', 'nickname', 'profile_image']
            }],
            order: [['employee_id', 'ASC']],
            limit: 6 // Show 6 employees
        });

        // Convert service image keys to signed urls for views
        const servicesWithUrls = services.map(svc => {
            const obj = svc.toJSON();
            ['image1','image2','image3'].forEach(k => {
                if (obj[k]) {
                    try { obj[`${k}_url`] = getSignedUrl(obj[k], 60*60*24*7); } catch(e) { obj[`${k}_url`] = null; }
                }
            });
            return obj;
        });

        // Add profile image signed url for employees
        const employeesWithUrls = employees.map(emp => {
            const ej = emp.toJSON();
            if (ej.User && ej.User.profile_image) {
                try { ej.User.profile_image_url = getSignedUrl(ej.User.profile_image, 60*60*24*7); } catch(e) { ej.User.profile_image_url = null; }
            }
            return ej;
        });

        res.render("user_home", { 
            services: servicesWithUrls, 
            employees: employeesWithUrls,
            user: req.user || null // Pass authenticated user if available
        });
    } catch (error) {
        console.error('Error loading home page:', error);
        res.status(500).send('Error loading page');
    }
}

const BookingService = async (req, res) => {
    try {
        const userId = req.user.user_id; // Get from authenticated user
        const service_id = req.params.service_id;
    const { appointment_date, appointment_time, type, extra, employee, extras } = req.body;
        const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
        
        // Check if the employee is already booked for this service at the selected date and time
        const service = await Service.findByPk(service_id);
        if (!service) {
            return res.status(404).send('Service not found');
        }
        
        const existingAppointment = await Appointment.findOne({
            where: {
                employee_id: employee,
                service_id: service_id,
                appointment_date: {
                    [sequelize.Op.between]: [
                        new Date(appointmentDateTime.getTime() - (service.duration || 60) * 60000),
                        new Date(appointmentDateTime.getTime() + (service.duration || 60) * 60000)
                    ]
                },
                status: { [sequelize.Op.not]: 'canceled' }
            }
        });
        
        if (existingAppointment) {
            return res.status(400).send('Employee is already booked for this service at the selected time.');
        }
        
        // Parse extras JSON if provided (from client-side hidden input)
        let extrasObj = null;
        if (extras) {
            try { extrasObj = JSON.parse(extras); } catch (e) { extrasObj = null; }
        }

        const newAppointment = await Appointment.create({
            user_id: userId,
            service_id: service_id,
            employee_id: employee,
            appointment_date: appointmentDateTime,
            extras: extrasObj ? JSON.stringify(extrasObj) : null,
            status: 'booked',
        });
        
        res.redirect('/user/history');
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).send('Error creating appointment');
    }
}

const showSpa = async (req, res) => {
    try {
        const services = await Service.findAll({ where: { type: 'spa' } });
        const servicesWithUrls = services.map(svc => {
            const obj = svc.toJSON();
            ['image1','image2','image3'].forEach(k => {
                if (obj[k]) {
                    try { obj[`${k}_url`] = getSignedUrl(obj[k], 60*60*24*7); } catch(e) { obj[`${k}_url`] = null; }
                }
            });
            return obj;
        });

        res.render("user_viewservice_spa", { 
            services: servicesWithUrls,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading spa services:', error);
        res.status(500).send('Error loading page');
    }
}

const showBookingSpa = async (req, res) => {
    try {
        const service_id = req.params.service_id;
        const service = await Service.findByPk(service_id, {
            include: [
                { model: Employee, 
                    include: [
                    { model: User }
                ]}]
        });
        if (!service || service.type !== 'spa') {
            return res.status(404).send('Service not found or not a spa service');
        }
        // prepare signed urls on service and included users
        const s = service ? service.toJSON() : null;
        if (s) {
            ['image1','image2','image3'].forEach(k => {
                if (s[k]) {
                    try { s[`${k}_url`] = getSignedUrl(s[k], 60*60*24*7); } catch(e) { s[`${k}_url`] = null; }
                }
            });
            if (s.Employees) {
                s.Employees = s.Employees.map(emp => {
                    if (emp.User && emp.User.profile_image) {
                        try { emp.User.profile_image_url = getSignedUrl(emp.User.profile_image, 60*60*24*7); } catch(e) { emp.User.profile_image_url = null; }
                    }
                    return emp;
                });
            }
        }

        res.render("user_booking_spa", { 
            service: s,
            user: req.user
        });
    } catch (error) {
        console.error('Error loading booking page:', error);
        res.status(500).send('Error loading page');
    }
}


const showHair = async (req, res) => {
    try {
        const services = await Service.findAll({ where: { type: 'hair' } });
        const servicesWithUrls = services.map(svc => {
            const obj = svc.toJSON();
            ['image1','image2','image3'].forEach(k => {
                if (obj[k]) {
                    try { obj[`${k}_url`] = getSignedUrl(obj[k], 60*60*24*7); } catch(e) { obj[`${k}_url`] = null; }
                }
            });
            return obj;
        });

        res.render("user_viewservice_hair", { 
            services: servicesWithUrls,
            user: req.user || null
        });
    } catch (error) {
        console.error('Error loading hair services:', error);
        res.status(500).send('Error loading page');
    }
}

const showBookingHair = async (req, res) => {
    try {
        const service_id = req.params.service_id;
        const service = await Service.findByPk(service_id, {
            include: [
                { model: Employee, 
                    include: [
                    { model: User }
                ]}]
        });
        if (!service || service.type !== 'hair') {
            return res.status(404).send('Service not found or not a hair service');
        }
        const s = service ? service.toJSON() : null;
        if (s) {
            ['image1','image2','image3'].forEach(k => {
                if (s[k]) {
                    try { s[`${k}_url`] = getSignedUrl(s[k], 60*60*24*7); } catch(e) { s[`${k}_url`] = null; }
                }
            });
            if (s.Employees) {
                s.Employees = s.Employees.map(emp => {
                    if (emp.User && emp.User.profile_image) {
                        try { emp.User.profile_image_url = getSignedUrl(emp.User.profile_image, 60*60*24*7); } catch(e) { emp.User.profile_image_url = null; }
                    }
                    return emp;
                });
            }
        }

        res.render("user_booking_hair", { 
            service: s,
            user: req.user
        });
    } catch (error) {
        console.error('Error loading booking page:', error);
        res.status(500).send('Error loading page');
    }
};

const showHistory = async (req, res) => {
    try {
        const userId = req.user.user_id; // Get from authenticated user
        const appointments = await Appointment.findAll({
            where: { user_id: userId },
            include: [
                {model: Employee, include: [{ model: User }]}, User, Service
            ],
            order: [['appointment_date', 'DESC']]
        });
        appointments.forEach(appointment => {
            // parse extras JSON if present
            try {
                const a = appointment.toJSON ? appointment.toJSON() : appointment;
                if (a.extras) {
                    appointment.extrasObj = JSON.parse(a.extras);
                }
            } catch (e) {
                appointment.extrasObj = null;
            }

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
        res.render("user_history", { appointments: appointments, user: req.user });
    } catch (error) {
        console.error('Error loading history:', error);
        res.status(500).send('Error loading history');
    }
};

const CancelAppointments = async (req, res) => {
    const appointmentId = req.params.appointment_id;
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
        return res.status(404).send('Appointment not found');
    }

    if (appointment.status === 'canceled') {
        return res.status(200).send('Appointment is already canceled');
    }

    appointment.status = 'canceled';
    await appointment.save();

    return res.status(200).send('Appointment has been canceled successfully');
};

// Update user profile data and optional profile image upload to S3
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { first_name, last_name, nickname, phone } = req.body || {};

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;
        if (nickname !== undefined) user.nickname = nickname || null;
        if (phone !== undefined) user.phone = phone || null;

        // If file uploaded via multer (memoryStorage), handle S3 upload
        if (req.file && req.file.buffer) {
            const ext = path.extname(req.file.originalname) || '';
            const fileName = `users/${userId}/profile_${Date.now()}${ext}`;
            const key = await uploadFile(req.file.buffer, fileName, req.file.mimetype);
            user.profile_image = key;
        }

        await user.save();

        const userObj = user.toJSON();
        if (userObj.profile_image) {
            try {
                userObj.profile_image_url = getSignedUrl(userObj.profile_image, 60 * 60 * 24 * 7);
            } catch (e) {
                userObj.profile_image_url = null;
            }
        }

        return res.status(200).json({ success: true, user: userObj });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { showMainUser, BookingService, showSpa, showBookingSpa, showHair, showBookingHair, showHistory, CancelAppointments, updateProfile };