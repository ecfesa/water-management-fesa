const express = require('express');
const router = express.Router();
const { Usage, Category } = require('../models');
const { Op } = require('sequelize');

// Default categories to create if none exist
const defaultCategories = [
  { name: 'Kitchen', description: 'Kitchen water usage', icon: 'restaurant', color: '#2f95dc' },
  { name: 'Bathroom', description: 'Bathroom water usage', icon: 'water', color: '#34c759' },
  { name: 'Laundry', description: 'Laundry water usage', icon: 'shirt', color: '#ff9500' },
  { name: 'Garden', description: 'Garden water usage', icon: 'leaf', color: '#ff2d55' },
  { name: 'Other', description: 'Other water usage', icon: 'apps', color: '#5856d6' }
];

// Helper function to ensure categories exist
const ensureCategoriesExist = async () => {
  const existingCategories = await Category.findAll();
  if (existingCategories.length === 0) {
    await Category.bulkCreate(defaultCategories);
    return await Category.findAll();
  }
  return existingCategories;
};

// Simulate one month of usage data
router.post('/simulate-month', async (req, res) => {
  try {
    // Ensure categories exist before simulating data
    const categories = await ensureCategoriesExist();
    
    const today = new Date();
    const simulatedData = [];

    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate 2-5 random usages per day
      const usagesPerDay = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < usagesPerDay; j++) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const amount = Math.floor(Math.random() * 100) + 10; // Random amount between 10 and 110

        simulatedData.push({
          date,
          amount,
          categoryId: randomCategory.id,
          notes: 'Simulated data'
        });
      }
    }

    // Bulk create the simulated data
    await Usage.bulkCreate(simulatedData);

    res.json({ 
      message: 'Successfully simulated one month of usage data',
      categoriesCreated: categories.length
    });
  } catch (error) {
    console.error('Error simulating data:', error);
    res.status(500).json({ message: 'Error simulating usage data' });
  }
});

// Clear simulated data
router.delete('/clear-simulated-data', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Usage.destroy({
      where: {
        date: {
          [Op.gte]: thirtyDaysAgo
        },
        notes: 'Simulated data'
      }
    });

    res.json({ message: 'Successfully cleared simulated data' });
  } catch (error) {
    console.error('Error clearing simulated data:', error);
    res.status(500).json({ message: 'Error clearing simulated data' });
  }
});

module.exports = router; 