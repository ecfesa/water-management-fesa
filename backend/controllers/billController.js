const { Bill, User } = require('../models');

// Create new bill
exports.createBill = async (req, res) => {
  try {
    console.log('Creating bill with data:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);
    
    // Validate required fields
    if (!req.body.amount || !req.body.dueDate || !req.body.waterUsed) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: 'Amount, due date, and water used are required'
      });
    }

    const {
      amount,
      dueDate,
      waterUsed,
      billPeriodStart,
      billPeriodEnd
    } = req.body;

    // Validate numeric fields
    const parsedAmount = parseFloat(amount);
    const parsedWaterUsed = parseFloat(waterUsed);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({
        message: 'Invalid amount',
        details: 'Amount must be a positive number'
      });
    }

    if (isNaN(parsedWaterUsed) || parsedWaterUsed < 0) {
      return res.status(400).json({
        message: 'Invalid water usage',
        details: 'Water used must be a positive number'
      });
    }

    // Create bill data object
    const billData = {
      userId: req.user.id,
      amount: parsedAmount,
      dueDate: new Date(dueDate),
      waterUsed: parsedWaterUsed
    };

    // Add photo URL if file was uploaded
    if (req.file) {
      billData.photoUrl = `/uploads/${req.file.filename}`;
      console.log('Added photo URL:', billData.photoUrl);
    }

    // Only add optional dates if they exist
    if (billPeriodStart) {
      const startDate = new Date(billPeriodStart);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          message: 'Invalid bill period start date',
          details: 'Please provide a valid date'
        });
      }
      billData.billPeriodStart = startDate;
    }
    
    if (billPeriodEnd) {
      const endDate = new Date(billPeriodEnd);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({
          message: 'Invalid bill period end date',
          details: 'Please provide a valid date'
        });
      }
      billData.billPeriodEnd = endDate;
    }

    console.log('Creating bill with processed data:', billData);
    
    const bill = await Bill.create(billData);
    console.log('Bill created successfully:', bill.id);
    
    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating bill:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
      stack: error.stack
    });
    
    // Send more detailed error response
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? error.errors.map(e => e.message) : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all bills for the user
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.findAll({
      where: { userId: req.user.id },
      order: [['billPeriodEnd', 'DESC']]
    });
    res.json({ bills });
  } catch (error) {
    console.error('Error fetching bills:', error);
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
    console.error('Error fetching bill:', error);
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
    
    if (amount !== undefined) bill.amount = parseFloat(amount);
    if (dueDate) bill.dueDate = new Date(dueDate);
    if (waterUsed !== undefined) bill.waterUsed = parseFloat(waterUsed);
    if (billPeriodStart) bill.billPeriodStart = new Date(billPeriodStart);
    if (billPeriodEnd) bill.billPeriodEnd = new Date(billPeriodEnd);
    if (photoUrl) bill.photoUrl = photoUrl;
    
    await bill.save();
    res.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? error.errors.map(e => e.message) : undefined
    });
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
    
    bill.paidDate = paidDate ? new Date(paidDate) : new Date();
    await bill.save();
    
    res.json(bill);
  } catch (error) {
    console.error('Error marking bill as paid:', error);
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
    console.error('Error deleting bill:', error);
    res.status(400).json({ message: error.message });
  }
}; 