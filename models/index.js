const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
  }
);

const User = require('./user')(sequelize);
const Staff = require('./staff')(sequelize);
const Service = require('./service')(sequelize);
const StaffService = require('./staffService')(sequelize);
const Appointment = require('./appointment')(sequelize);
const Product = require('./product')(sequelize);
const ProductUsage = require('./productUsage')(sequelize);


// Relations
User.hasOne(Staff, { foreignKey: 'user_id' });
Staff.belongsTo(User, { foreignKey: 'user_id' });

Staff.belongsToMany(Service, { through: StaffService, foreignKey: 'staff_id' });
Service.belongsToMany(Staff, { through: StaffService, foreignKey: 'service_id' });
StaffService.belongsTo(Staff, { foreignKey: 'staff_id' });
StaffService.belongsTo(Service, { foreignKey: 'service_id' });

User.hasMany(Appointment, { foreignKey: 'user_id' });
Appointment.belongsTo(User, { foreignKey: 'user_id' });

Staff.hasMany(Appointment, { foreignKey: 'staff_id' });
Appointment.belongsTo(Staff, { foreignKey: 'staff_id' });

Service.hasMany(Appointment, { foreignKey: 'service_id' });
Appointment.belongsTo(Service, { foreignKey: 'service_id' });

Staff.hasMany(ProductUsage, { foreignKey: 'staff_id' });
ProductUsage.belongsTo(Staff, { foreignKey: 'staff_id' });

Product.hasMany(ProductUsage, { foreignKey: 'product_id' });
ProductUsage.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = {
  sequelize,
  User,
  Staff,
  Service,
  StaffService,
  Appointment,
  Product,
  ProductUsage
};