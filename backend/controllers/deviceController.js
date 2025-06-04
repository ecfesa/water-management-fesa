const { Device, Category } = require('../models');

// Create new device
exports.createDevice = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    const device = await Device.create({ name, description, categoryId });
    res.status(201).json(device);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all devices
exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({
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
    const device = await Device.findByPk(req.params.id, {
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
    const device = await Device.findByPk(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
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
    const device = await Device.findByPk(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    
    await device.destroy();
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 