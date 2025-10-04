// models/staffService.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('StaffService', {
    staff_id: { type: DataTypes.INTEGER, primaryKey: true },
    service_id: { type: DataTypes.INTEGER, primaryKey: true },
  }, {
    tableName: 'staff_services',
    timestamps: false
  });
};
