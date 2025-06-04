const { Category, Device } = require('../models');

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await Category.create({ name, icon });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
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
    
    console.log('Categories with devices:', JSON.stringify(transformedCategories, null, 2));
    
    res.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
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
    const category = await Category.findByPk(req.params.id);
    
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
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 