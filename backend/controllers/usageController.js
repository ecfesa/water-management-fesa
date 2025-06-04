const { Usage, Device } = require('../models');

// Create new usage record
exports.createUsage = async (req, res) => {
  try {
    const { deviceId, value, notes } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    // Validate device exists and belongs to user
    const device = await Device.findOne({
      where: { 
        id: deviceId,
        userId
      }
    });

    if (!device) {
      return res.status(400).json({ message: `Device with ID ${deviceId} not found or doesn't belong to you` });
    }

    const usage = await Usage.create({
      deviceId,
      value,
      notes,
      timestamp: new Date(),
      userId
    });
    res.status(201).json(usage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all usage records
exports.getUsages = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const usages = await Usage.findAll({
      where: { userId }, // Only get usages for this user
      include: [{
        model: Device,
        attributes: ['name']
      }],
      order: [['timestamp', 'DESC']]
    });
    res.json(usages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get usage by ID
exports.getUsageById = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const usage = await Usage.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure usage belongs to user
      },
      include: [{
        model: Device,
        attributes: ['name']
      }]
    });
    
    if (!usage) {
      return res.status(404).json({ message: 'Usage record not found' });
    }
    
    res.json(usage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get usage by device ID
exports.getUsageByDevice = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const deviceId = req.params.deviceId;

    // Validate device belongs to user
    const device = await Device.findOne({
      where: { 
        id: deviceId,
        userId
      }
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found or doesn\'t belong to you' });
    }

    const usages = await Usage.findAll({
      where: { 
        deviceId,
        userId // Ensure usages belong to user
      },
      include: [{
        model: Device,
        attributes: ['name']
      }],
      order: [['timestamp', 'DESC']]
    });
    res.json(usages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update usage record
exports.updateUsage = async (req, res) => {
  try {
    const { value, notes } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    const usage = await Usage.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure usage belongs to user
      }
    });
    
    if (!usage) {
      return res.status(404).json({ message: 'Usage record not found' });
    }
    
    if (value) usage.value = value;
    if (notes) usage.notes = notes;
    
    await usage.save();
    res.json(usage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete usage record
exports.deleteUsage = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const usage = await Usage.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure usage belongs to user
      }
    });
    
    if (!usage) {
      return res.status(404).json({ message: 'Usage record not found' });
    }
    
    await usage.destroy();
    res.json({ message: 'Usage record deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 