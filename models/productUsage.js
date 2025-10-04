// models/productUsage.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ProductUsage', {
    usage_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    staff_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER },
  }, {
    tableName: 'product_usage',
    timestamps: false
  });
};
