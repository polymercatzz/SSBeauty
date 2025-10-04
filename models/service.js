// models/service.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Service', {
    service_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10,2) },
    duration: { type: DataTypes.INTEGER }, // นาที
  }, {
    tableName: 'services',
    timestamps: false
  });
};
