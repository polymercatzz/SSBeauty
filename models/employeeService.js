// models/employeeService.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('EmployeeService', {
    employee_id: { type: DataTypes.INTEGER, primaryKey: true, field: 'staff_id' },
    service_id: { type: DataTypes.INTEGER, primaryKey: true },
  }, {
    tableName: 'staff_services',  // Keep database table name for backward compatibility
    timestamps: false
  });
};
