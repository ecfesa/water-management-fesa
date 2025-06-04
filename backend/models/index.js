const User = require('./User');
const Category = require('./Category');
const Device = require('./Device');
const Usage = require('./Usage');
const Bill = require('./Bill');

// Define associations
Category.hasMany(Device, { foreignKey: 'categoryId' });
Device.belongsTo(Category, { foreignKey: 'categoryId' });

Category.hasMany(Usage, { foreignKey: 'categoryId' });
Usage.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(Device, { foreignKey: 'userId' });
Device.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Usage, { foreignKey: 'userId' });
Usage.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Bill, { foreignKey: 'userId' });
Bill.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Category,
  Device,
  Usage,
  Bill
}; 