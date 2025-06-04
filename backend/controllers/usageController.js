const { Usage, Device } = require('../models');

// Create new usage record
exports.createUsage = async (req, res) => {
  try {
    const { deviceId, value, notes } = req.body;
    const usage = await Usage.create({
      deviceId,
      value,
      notes,
      timestamp: new Date()
    });
    res.status(201).json(usage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all usage records
exports.getUsages = async (req, res) => {
  try {
    const usages = await Usage.findAll({
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
    const usage = await Usage.findByPk(req.params.id, {
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
    const usages = await Usage.findAll({
      where: { deviceId: req.params.deviceId },
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
    const usage = await Usage.findByPk(req.params.id);
    
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
    const usage = await Usage.findByPk(req.params.id);
    
    if (!usage) {
      return res.status(404).json({ message: 'Usage record not found' });
    }
    
    await usage.destroy();
    res.json({ message: 'Usage record deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 