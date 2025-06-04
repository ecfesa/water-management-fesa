const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const billController = require('../controllers/billController');
const { validateRequest, authenticate } = require('../middleware/validation');

// Validation middleware for creation
const createBillValidation = [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('waterUsed').isFloat({ min: 0 }).withMessage('Water used must be a positive number'),
  body('billPeriodStart').isISO8601().withMessage('Valid bill period start date is required'),
  body('billPeriodEnd').isISO8601().withMessage('Valid bill period end date is required'),
  body('photoUrl').optional().isURL().withMessage('Valid URL is required for photo')
];

// Validation middleware for updates
const updateBillValidation = [
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('waterUsed').optional().isFloat({ min: 0 }).withMessage('Water used must be a positive number'),
  body('billPeriodStart').optional().isISO8601().withMessage('Valid bill period start date is required'),
  body('billPeriodEnd').optional().isISO8601().withMessage('Valid bill period end date is required'),
  body('photoUrl').optional().isURL().withMessage('Valid URL is required for photo')
];

const paidDateValidation = [
  body('paidDate').optional().isISO8601().withMessage('Valid paid date is required')
];

// Routes
router.post('/', authenticate, createBillValidation, validateRequest, billController.createBill);
router.get('/', authenticate, billController.getBills);
router.get('/:id', authenticate, billController.getBillById);
router.patch('/:id', authenticate, updateBillValidation, validateRequest, billController.updateBill);
router.patch('/:id/paid', authenticate, paidDateValidation, validateRequest, billController.markAsPaid);
router.delete('/:id', authenticate, billController.deleteBill);

module.exports = router; 