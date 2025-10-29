// models/user.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    first_name: { type: DataTypes.STRING(255), allowNull: false },
    last_name: { type: DataTypes.STRING(255), allowNull: false },
    nickname: { type: DataTypes.STRING(255), allowNull: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('customer', 'staff', 'admin'), allowNull: false }, // Note: 'staff' in DB refers to 'employee' in code
    phone: { type: DataTypes.STRING(15), allowNull: true },
    is_suspended: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
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
