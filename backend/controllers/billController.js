const { Bill, User } = require('../models');

// Create new bill
exports.createBill = async (req, res) => {
  try {
    const {
      amount,
      dueDate,
      waterUsed,
      billPeriodStart,
      billPeriodEnd,
      photoUrl
    } = req.body;

    const bill = await Bill.create({
      userId: req.user.id,
      amount,
      dueDate,
      waterUsed,
      billPeriodStart,
      billPeriodEnd,
      photoUrl
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all bills for the user
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      where: { userId: req.user.id },
      order: [['billPeriodEnd', 'DESC']]
    });
    res.json(bills);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update bill
exports.updateBill = async (req, res) => {
  try {
    const {
      amount,
      dueDate,
      waterUsed,
      billPeriodStart,
      billPeriodEnd,
      photoUrl
    } = req.body;

    const bill = await Bill.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    if (amount) bill.amount = amount;
    if (dueDate) bill.dueDate = dueDate;
    if (waterUsed) bill.waterUsed = waterUsed;
    if (billPeriodStart) bill.billPeriodStart = billPeriodStart;
    if (billPeriodEnd) bill.billPeriodEnd = billPeriodEnd;
    if (photoUrl) bill.photoUrl = photoUrl;
    
    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark bill as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { paidDate } = req.body;
    const bill = await Bill.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    bill.paidDate = paidDate || new Date();
    await bill.save();
    
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete bill
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    await bill.destroy();
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 