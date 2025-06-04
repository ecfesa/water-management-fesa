const express = require('express');
const router = express.Router();
const { Usage, Category } = require('../models');
const { Op } = require('sequelize');

// Get daily usage metrics
router.get('/daily-usage', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 10;
    const categories = req.query.categories ? req.query.categories.split(',') : [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const whereClause = {
      date: {
        [Op.gte]: startDate
      }
    };

    if (categories.length > 0) {
      whereClause.categoryId = {
        [Op.in]: categories
      };
    }

    const usages = await Usage.findAll({
      where: whereClause,
      include: [{
        model: Category,
        attributes: ['id', 'name']
      }],
      order: [['date', 'ASC']]
    });

    // Group data by date and category
    const chartData = [];
    const dateMap = new Map();

    usages.forEach(usage => {
      const dateStr = usage.date.toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          total: 0
        });
      }
      const dayData = dateMap.get(dateStr);
      dayData.total += usage.amount;
      dayData[`category_${usage.Category.id}`] = (dayData[`category_${usage.Category.id}`] || 0) + usage.amount;
    });

    // Convert map to array
    const chartDataArray = Array.from(dateMap.values());

    // Get available categories
    const availableCategories = await Category.findAll({
      attributes: ['id', 'name']
    });

    res.json({
      chartData: chartDataArray,
      availableCategories
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Error fetching metrics data' });
  }
});

module.exports = router; 