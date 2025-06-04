const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const deviceController = require('../controllers/deviceController');
const { validateRequest, authenticate } = require('../middleware/validation');

// Validation middleware for creation
const createDeviceValidation = [
  body('name').notEmpty().withMessage('Device name is required'),
  body('categoryId').isUUID().withMessage('Valid category ID is required')
];

// Validation middleware for updates
const updateDeviceValidation = [
  body('name').optional().notEmpty().withMessage('Device name cannot be empty'),
  body('categoryId').optional().isUUID().withMessage('Valid category ID is required')
];

// Routes
router.post('/', authenticate, createDeviceValidation, validateRequest, deviceController.createDevice);
router.get('/', authenticate, deviceController.getDevices);
router.get('/:id', authenticate, deviceController.getDeviceById);
router.patch('/:id', authenticate, updateDeviceValidation, validateRequest, deviceController.updateDevice);
router.delete('/:id', authenticate, deviceController.deleteDevice);

module.exports = router; 