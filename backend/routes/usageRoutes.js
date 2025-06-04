const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const usageController = require('../controllers/usageController');
const { validateRequest, authenticate } = require('../middleware/validation');

// Validation middleware for creation
const createUsageValidation = [
  body('deviceId').isUUID().withMessage('Valid device ID is required'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('notes').optional()
];

// Validation middleware for updates
const updateUsageValidation = [
  body('deviceId').optional().isUUID().withMessage('Valid device ID is required'),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('notes').optional()
];

// Routes
router.post('/', authenticate, createUsageValidation, validateRequest, usageController.createUsage);
router.get('/', authenticate, usageController.getUsages);
router.get('/:id', authenticate, usageController.getUsageById);
router.get('/device/:deviceId', authenticate, usageController.getUsageByDevice);
router.patch('/:id', authenticate, updateUsageValidation, validateRequest, usageController.updateUsage);
router.delete('/:id', authenticate, usageController.deleteUsage);

module.exports = router; 