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
      min: 0,
      isFloat: true
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  waterUsed: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      isFloat: true
    }
  },
  billPeriodStart: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  billPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeValidate: (bill) => {
      // Ensure numeric fields are properly formatted
      if (bill.amount) {
        bill.amount = parseFloat(bill.amount);
      }
      if (bill.waterUsed) {
        bill.waterUsed = parseFloat(bill.waterUsed);
      }
      
      // Ensure dates are properly formatted
      if (bill.dueDate) {
        bill.dueDate = new Date(bill.dueDate);
      }
      if (bill.paidDate) {
        bill.paidDate = new Date(bill.paidDate);
      }
      if (bill.billPeriodStart) {
        bill.billPeriodStart = new Date(bill.billPeriodStart);
      }
      if (bill.billPeriodEnd) {
        bill.billPeriodEnd = new Date(bill.billPeriodEnd);
      }
    }
  }
});

module.exports = Bill; 