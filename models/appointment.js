// models/appointment.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Appointment', {
    appointment_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    employee_id: { type: DataTypes.INTEGER, allowNull: false, field: 'staff_id' },
    appointment_date: { type: DataTypes.DATE },
  extras: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.ENUM('booked', 'in_progress', 'completed', 'canceled'), defaultValue: 'booked' },
  }, {
    tableName: 'appointments',
    timestamps: false
  });
};
