// models/user.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    first_name: { type: DataTypes.STRING(255), allowNull: false },
    last_name: { type: DataTypes.STRING(255), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('customer', 'staff', 'admin'), allowNull: false },
    phone: { type: DataTypes.STRING(15), allowNull: true },
  }, {
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  });
};
