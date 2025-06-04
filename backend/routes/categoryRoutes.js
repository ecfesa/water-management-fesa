const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { validateRequest, authenticate } = require('../middleware/validation');
const { Category } = require('../models');

// Validation middleware for creation
const createCategoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('iconName').optional()
];

// Validation middleware for updates
const updateCategoryValidation = [
  body('name').optional().notEmpty().withMessage('Category name cannot be empty'),
  body('iconName').optional()
];

// Routes
router.post('/', authenticate, createCategoryValidation, validateRequest, categoryController.createCategory);
router.get('/', authenticate, categoryController.getCategories);
router.get('/:id', authenticate, categoryController.getCategoryById);
router.patch('/:id', authenticate, updateCategoryValidation, validateRequest, categoryController.updateCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);

// Get all categories
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get a single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const category = await Category.create({
      name,
      description,
      icon,
      color
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.update({
      name,
      description,
      icon,
      color
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

module.exports = router; 