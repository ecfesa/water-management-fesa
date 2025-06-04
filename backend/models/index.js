const User = require('./User');
const Category = require('./Category');
const Device = require('./Device');
const Usage = require('./Usage');
const Bill = require('./Bill');

// Define associations
Category.hasMany(Device, {
  foreignKey: 'categoryId',
  as: 'Devices'
});
Device.belongsTo(Category, {
  foreignKey: 'categoryId'
});

Device.hasMany(Usage, {
  foreignKey: 'deviceId',
  as: 'Usages'
});
Usage.belongsTo(Device, {
  foreignKey: 'deviceId'
});

Category.hasMany(Usage, {
  foreignKey: 'categoryId',
  as: 'Usages'
});
Usage.belongsTo(Category, {
  foreignKey: 'categoryId'
});

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