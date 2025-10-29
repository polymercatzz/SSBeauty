// models/service.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Service', {
    service_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    type: { type: DataTypes.ENUM('hair', 'spa'), allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10,2) },
    duration: { type: DataTypes.INTEGER }, // นาที
    image1: { type: DataTypes.STRING(255) }, // S3 key for image 1
    image2: { type: DataTypes.STRING(255) }, // S3 key for image 2
    image3: { type: DataTypes.STRING(255) }, // S3 key for image 3
  }, {
    tableName: 'services',
    timestamps: false,
  });
};

