// models/employee.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Employee', {
    employee_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: 'staff_id' },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    position: { type: DataTypes.STRING(50) },
    bio: { type: DataTypes.TEXT },
    skills: { type: DataTypes.TEXT },
    schedule: { type: DataTypes.TEXT },
    salary: { type: DataTypes.DECIMAL(10,2) },
    commission_rate: { type: DataTypes.DECIMAL(10,2) },
  }, {
    tableName: 'staffs',  // Keep database table name for backward compatibility
    timestamps: false
  });
};
