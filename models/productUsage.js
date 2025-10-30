// models/productUsage.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ProductUsage', {
    usage_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false, field: 'staff_id' },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER },
  // Date/time when the product was used/picked up
  usage_date: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') }
  }, {
    tableName: 'product_usage',
    timestamps: false
  });
};
