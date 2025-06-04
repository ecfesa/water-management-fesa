const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bill = sequelize.define('Bill', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  waterUsed: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  billPeriodStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  billPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: false
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Bill; 