// models/productUsage.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ProductUsage', {
    usage_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false, field: 'staff_id' },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER },
  }, {
    tableName: 'product_usage',
    timestamps: false
  });
};
