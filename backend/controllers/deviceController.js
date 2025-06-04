const { Device, Category } = require('../models');

// Create new device
exports.createDevice = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request
    
    // Validate category exists and belongs to user
    const category = await Category.findOne({
      where: { 
        id: categoryId,
        userId
      }
    });
    
    if (!category) {
      return res.status(400).json({ message: `Category with ID ${categoryId} not found or doesn't belong to you` });
    }

    const device = await Device.create({ 
      name, 
      description, 
      categoryId,
      userId
    });
    
    res.status(201).json(device);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? error.errors.map(e => e.message) : undefined
    });
  }
};

// Get all devices
exports.getDevices = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const devices = await Device.findAll({
      where: { userId }, // Only get devices for this user
      include: [{
        model: Category,
        attributes: ['name', 'icon']
      }]
    });
    res.json(devices);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const device = await Device.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure device belongs to user
      },
      include: [{
        model: Category,
        attributes: ['name', 'icon']
      }]
    });
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    const device = await Device.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure device belongs to user
      }
    });
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // If categoryId is being updated, validate it belongs to user
    if (categoryId) {
      const category = await Category.findOne({
        where: { 
          id: categoryId,
          userId
        }
      });
      
      if (!category) {
        return res.status(400).json({ message: `Category with ID ${categoryId} not found or doesn't belong to you` });
      }
    }
    
    if (name) device.name = name;
    if (description !== undefined) device.description = description;
    if (categoryId) device.categoryId = categoryId;
    
    await device.save();
    res.json(device);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const device = await Device.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure device belongs to user
      }
    });
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    await device.destroy();
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 