// models/staff.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Staff', {
    staff_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    position: { type: DataTypes.STRING(50) },
    schedule: { type: DataTypes.TEXT },
    salary: { type: DataTypes.DECIMAL(10,2) },
    commission_rate: { type: DataTypes.DECIMAL(10,2) },
  }, {
    tableName: 'staffs',
    timestamps: false
  });
};
