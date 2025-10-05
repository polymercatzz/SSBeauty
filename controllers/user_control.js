const sequelize = require('sequelize');
const {   User,
  Staff,
  Service,
  Appointment,
  Product } = require('../models');

const showMainUser = async (req, res) => {
    const services = await Service.findAll();
    const staffs = await Staff.findAll();
    res.render("user_home", { services: services, staffs: staffs });
}

const BookingService = async (req, res) => {
    const userId = 1;
    const service_id = req.params.service_id;
    const { appointment_date, appointment_time, type, extra, staff } = req.body;
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    // Check if the staff is already booked for this service at the selected date and time
    const service = await Service.findByPk(service_id);
    if (!service) {
        return res.send('Service not found');
    }
    const existingAppointment = await Appointment.findOne({
        where: {
        staff_id: staff,
        service_id: service_id,
        appointment_date: {
            [sequelize.Op.between]: [
                new Date(appointmentDateTime.getTime() - (service.duration || 60) * 60000),
                new Date(appointmentDateTime.getTime() + (service.duration || 60) * 60000)
            ]
        },
        staff_id: staff,
        status: { [sequelize.Op.not]: 'canceled' }
        }
    });
    if (existingAppointment) {
        return res.send('Staff is already booked for this service at the selected time.');
    } if (!service) {
        return res.send('Service not found');
    } 
    const newAppointment = await Appointment.create({
        user_id: userId,
        service_id: service_id,
        staff_id: staff,
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
            { model: Staff, 
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
            { model: Staff, 
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
            {model: Staff, include: [{ model: User }]}, User, Service
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