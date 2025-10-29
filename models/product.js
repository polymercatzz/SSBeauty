// models/product.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Product', {
    product_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    price: { type: DataTypes.DECIMAL(10,2) },
    stock_qty: { type: DataTypes.INTEGER },
    unit: { type: DataTypes.STRING(50) },
    image_url: { type: DataTypes.STRING(255) },
  }, {
    tableName: 'products',
    timestamps: false
  });
};
