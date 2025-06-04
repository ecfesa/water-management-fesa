const express = require('express');
const router = express.Router();
const { Usage, Category, Device, User } = require('../models');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Helper function to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Test endpoint to verify authentication
router.get('/verify-auth', verifyToken, async (req, res) => {
  try {
    console.log('Auth Check - Token payload:', req.user);
    
    // Get user details from database to verify
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({
        message: 'User not found in database',
        userId: req.user.id
      });
    }

    res.json({
      message: 'Authentication verified',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({
      message: 'Error verifying authentication',
      error: error.message
    });
  }
});

// Default categories to create if none exist
const defaultCategories = [
  { name: 'Kitchen', description: 'Kitchen water usage', icon: 'restaurant', color: '#2f95dc' },
  { name: 'Bathroom', description: 'Bathroom water usage', icon: 'water', color: '#34c759' },
  { name: 'Laundry', description: 'Laundry water usage', icon: 'shirt', color: '#ff9500' },
  { name: 'Garden', description: 'Garden water usage', icon: 'leaf', color: '#ff2d55' },
  { name: 'Other', description: 'Other water usage', icon: 'apps', color: '#5856d6' }
];

// Helper function to ensure categories and devices exist
const ensureCategoriesAndDevicesExist = async (userId) => {
  try {
    console.log('Ensuring categories and devices exist for user:', userId);
    
    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Get or create categories
    const existingCategories = await Category.findAll();
    let categories = existingCategories;
    
    if (existingCategories.length === 0) {
      categories = await Category.bulkCreate(defaultCategories);
      console.log('Created default categories:', categories.map(c => c.name));
    }

    // Create a device for each category if none exist
    const devices = [];
    for (const category of categories) {
      console.log(`Checking devices for category: ${category.name} (ID: ${category.id})`);
      
      const existingDevices = await Device.findAll({
        where: { 
          categoryId: category.id,
          userId: userId
        }
      });

      if (existingDevices.length === 0) {
        console.log(`Creating new device for category: ${category.name}`);
        const newDevice = await Device.create({
          name: `${category.name} Device`,
          description: `Default device for ${category.name}`,
          categoryId: category.id, // Ensure categoryId is set
          userId: userId
        });
        devices.push(newDevice);
        console.log(`Created device for ${category.name}:`, newDevice.name);
      } else {
        console.log(`Found existing devices for ${category.name}:`, existingDevices.length);
        devices.push(...existingDevices);
      }
    }

    if (devices.length === 0) {
      throw new Error('No devices were created or found');
    }

    console.log('Total devices available:', devices.length);
    return { categories, devices };
  } catch (error) {
    console.error('Error in ensureCategoriesAndDevicesExist:', error);
    throw error;
  }
};

// Simulate one month of usage data
router.post('/simulate-month', verifyToken, async (req, res) => {
  try {
    // Debug logging for request
    console.log('Simulate Request - Token payload:', req.user);
    
    const userId = req.user.id;
    console.log('Using userId from token:', userId);

    // Ensure categories and devices exist
    const { categories, devices } = await ensureCategoriesAndDevicesExist(userId);
    
    if (!devices || devices.length === 0) {
      throw new Error('No devices available to simulate usage for');
    }

    const today = new Date();
    const simulatedData = [];

    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate 2-5 random usages per day
      const usagesPerDay = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < usagesPerDay; j++) {
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        const value = Math.floor(Math.random() * 100) + 10; // Random amount between 10 and 110

        if (!randomDevice || !randomDevice.id) {
          console.error('Invalid device:', randomDevice);
          continue;
        }

        simulatedData.push({
          deviceId: randomDevice.id,
          categoryId: randomDevice.categoryId,
          value,
          timestamp: date,
          notes: 'Simulated data',
          userId: userId
        });
      }
    }

    if (simulatedData.length === 0) {
      throw new Error('No usage data was generated');
    }

    // Bulk create the simulated data
    const createdUsages = await Usage.bulkCreate(simulatedData, {
      validate: true
    });

    console.log(`Created ${createdUsages.length} usage records for user ${userId}`);

    res.json({ 
      message: 'Successfully simulated one month of usage data',
      categoriesCreated: categories.length,
      devicesUsed: devices.length,
      usagesCreated: createdUsages.length
    });
  } catch (error) {
    console.error('Error simulating data:', error);
    res.status(500).json({ 
      message: 'Error simulating usage data',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 