const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: '+07:00',
    dialectOptions: {
      dateStrings: true,
      useUTC: false,
    },
    logging: false,
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
  }
);

const User = require('./user')(sequelize);
const Employee = require('./employee')(sequelize);
const Service = require('./service')(sequelize);
const EmployeeService = require('./employeeService')(sequelize);
const Appointment = require('./appointment')(sequelize);
const Product = require('./product')(sequelize);
const ProductUsage = require('./productUsage')(sequelize);


// Relations
User.hasOne(Employee, { foreignKey: 'user_id' });
Employee.belongsTo(User, { foreignKey: 'user_id' });

Employee.belongsToMany(Service, { through: EmployeeService, foreignKey: 'employee_id' });
Service.belongsToMany(Employee, { through: EmployeeService, foreignKey: 'service_id' });
EmployeeService.belongsTo(Employee, { foreignKey: 'employee_id' });
EmployeeService.belongsTo(Service, { foreignKey: 'service_id' });

User.hasMany(Appointment, { foreignKey: 'user_id' });
Appointment.belongsTo(User, { foreignKey: 'user_id' });

Employee.hasMany(Appointment, { foreignKey: 'employee_id' });
Appointment.belongsTo(Employee, { foreignKey: 'employee_id' });

Service.hasMany(Appointment, { foreignKey: 'service_id' });
Appointment.belongsTo(Service, { foreignKey: 'service_id' });

Employee.hasMany(ProductUsage, { foreignKey: 'employee_id' });
ProductUsage.belongsTo(Employee, { foreignKey: 'employee_id' });

Product.hasMany(ProductUsage, { foreignKey: 'product_id' });
ProductUsage.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = {
  sequelize,
  User,
  Employee,
  Service,
  EmployeeService,
  Appointment,
  Product,
  ProductUsage
};