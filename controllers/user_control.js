const sequelize = require('sequelize');
const {   User,
  Employee,
  Service,
  Appointment,
  Product } = require('../models');

const showMainUser = async (req, res) => {
    const services = await Service.findAll();
    const employees = await Employee.findAll();
    res.render("user_home", { services: services, employees: employees });
}

const BookingService = async (req, res) => {
    const userId = 1;
    const service_id = req.params.service_id;
    const { appointment_date, appointment_time, type, extra, employee } = req.body;
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    // Check if the employee is already booked for this service at the selected date and time
    const service = await Service.findByPk(service_id);
    if (!service) {
        return res.send('Service not found');
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
        employee_id: employee,
        status: { [sequelize.Op.not]: 'canceled' }
        }
    });
    if (existingAppointment) {
        return res.send('Employee is already booked for this service at the selected time.');
    } if (!service) {
        return res.send('Service not found');
    } 
    const newAppointment = await Appointment.create({
        user_id: userId,
        service_id: service_id,
        employee_id: employee,
        appointment_date: appointmentDateTime,
        status: 'booked',
    });
    res.redirect('/user/history');
};

const showSpa = async (req, res) => {
    const services = await Service.findAll({ where: { type: 'spa' } });
    res.render("user_viewservice_spa", { services: services});
}

const showBookingSpa = async (req, res) => {
    const service_id = req.params.service_id;
    const service = await Service.findByPk(service_id, {
        include: [
            { model: Employee, 
                include: [
                { model: User }
            ]}]
    });
    if (!service || service.type !== 'spa') {
        return res.send('Service not found or not a spa service');
    };
    res.render("user_booking_spa", { service: service });
}


const showHair = async (req, res) => {
    const services = await Service.findAll({ where: { type: 'hair' } });
    res.render("user_viewservice_hair", { services: services});
}

const showBookingHair = async (req, res) => {
    const service_id = req.params.service_id;
    const service = await Service.findByPk(service_id, {
        include: [
            { model: Employee, 
                include: [
                { model: User }
            ]}]
    });
    if (!service || service.type !== 'hair') {
        return res.send('Service not found or not a hair service');
    };
    res.render("user_booking_hair", { service: service });
};

const showHistory = async (req, res) => {
    const userId = 1;
    const appointments = await Appointment.findAll({
        where: { user_id: userId },
        include: [
            {model: Employee, include: [{ model: User }]}, User, Service
        ],
        order: [['appointment_date', 'DESC']]
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
    res.render("user_history", { appointments: appointments });
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

module.exports = { showMainUser, BookingService, showSpa, showBookingSpa, showHair, showBookingHair, showHistory, CancelAppointments };