const { use } = require("../routes/userRoute");

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

const showSpa = async (req, res) => {
    const services = await Service.findAll({ where: { type: 'spa' } });
    res.render("user_viewservice_spa", { services: services});
}

const showBookingSpa = async (req, res) => {
    const service_id = req.params.serviec_id;
    const servie = await Service.findByPk(service_id, {
        include: [{ model: Staff}]
    });
    if (!servie || servie.type !== 'spa') {
        return res.send('Service not found or not a spa service');
    };
    res.render("user_booking_spa", { service: servie });
}


const showHair = async (req, res) => {
    const services = await Service.findAll({ where: { type: 'hair' } });
    res.render("user_viewservice_hair", { services: services});
}

const showBookingHair = async (req, res) => {
    const service_id = req.params.service_id;
    const servie = await Service.findByPk(service_id, {
        include: [{ model: Staff}]
    });
    if (!servie || servie.type !== 'hair') {
        return res.send('Service not found or not a hair service');
    };
    res.render("user_booking_hair", { service: servie });
};

const showHistory = async (req, res) => {
    const userId = 1;
    const appointments = await Appointment.findAll({
        where: { user_id: userId }
    });
    res.render("user_history", { appointments: appointments });
}

module.exports = { showMainUser, showSpa,showBookingSpa, showHair, showBookingHair, showHistory };