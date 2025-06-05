const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const billController = require('../controllers/billController');
const { validateRequest, authenticate } = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation middleware for creation
const createBillValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0 }).withMessage('Amount must be a positive number')
    .customSanitizer(value => parseFloat(value)),
  
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Invalid due date format. Please use a valid date.'),
  
  body('waterUsed')
    .notEmpty().withMessage('Water used is required')
    .isFloat({ min: 0 }).withMessage('Water used must be a positive number')
    .customSanitizer(value => parseFloat(value)),
  
  body('billPeriodStart')
    .optional()
    .isISO8601().withMessage('Invalid bill period start date format. Please use a valid date.'),
  
  body('billPeriodEnd')
    .optional()
    .isISO8601().withMessage('Invalid bill period end date format. Please use a valid date.')
];

// Validation middleware for updates
const updateBillValidation = [
  body('amount')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Amount must be a positive number');
      }
      return true;
    })
    .customSanitizer(value => parseFloat(value)),
  
  body('dueDate')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid due date format. Please use a valid date.');
      }
      return true;
    }),
  
  body('waterUsed')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Water used must be a positive number');
      }
      return true;
    })
    .customSanitizer(value => parseFloat(value)),
  
  body('billPeriodStart')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid bill period start date format. Please use a valid date.');
      }
      return true;
    }),
  
  body('billPeriodEnd')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid bill period end date format. Please use a valid date.');
      }
      return true;
    }),
];

const paidDateValidation = [
  body('paidDate')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid paid date format. Please use a valid date.');
      }
      return true;
    })
];

// Routes
router.post('/', authenticate, upload.single('billImage'), createBillValidation, validateRequest, billController.createBill);
router.get('/', authenticate, billController.getBills);
router.get('/:id', authenticate, billController.getBillById);
router.patch('/:id', authenticate, upload.single('billImage'), updateBillValidation, validateRequest, billController.updateBill);
router.patch('/:id/paid', authenticate, paidDateValidation, validateRequest, billController.markAsPaid);
router.delete('/:id', authenticate, billController.deleteBill);

module.exports = router; 