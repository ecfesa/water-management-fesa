const { Category, Device } = require('../models');

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    const category = await Category.create({ 
      name, 
      icon,
      userId 
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const categories = await Category.findAll({
      where: { userId }, // Only get categories for this user
      include: [{
        model: Device,
        attributes: ['id', 'name', 'description', 'categoryId'],
        as: 'Devices'
      }]
    });
    
    // Transform the response to ensure devices are properly included
    const transformedCategories = categories.map(category => {
      const plainCategory = category.get({ plain: true });
      return {
        ...plainCategory,
        devices: plainCategory.Devices || []
      };
    });
    
    res.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const category = await Category.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure category belongs to user
      },
      include: [{
        model: Device,
        attributes: ['id', 'name', 'description'],
        as: 'Devices'
      }]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    const category = await Category.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure category belongs to user
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    if (name) category.name = name;
    if (icon) category.icon = icon;
    
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request

    const category = await Category.findOne({
      where: { 
        id: req.params.id,
        userId // Ensure category belongs to user
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 