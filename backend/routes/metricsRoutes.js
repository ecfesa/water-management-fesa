const express = require('express');
const router = express.Router();
const { Usage, Category } = require('../models');
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

// Get daily usage metrics
router.get('/daily-usage', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 10;
    const categories = req.query.categories ? req.query.categories.split(',') : [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const whereClause = {
      timestamp: {
        [Op.gte]: startDate
      },
      userId // Add userId to filter
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
        attributes: ['id', 'name'],
        where: { userId }, // Ensure categories belong to user
        required: true
      }],
      order: [['timestamp', 'ASC']]
    });

    // Group data by date and category
    const chartData = [];
    const dateMap = new Map();

    usages.forEach(usage => {
      const dateStr = usage.timestamp.toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          total: 0
        });
      }
      const dayData = dateMap.get(dateStr);
      dayData.total += usage.value;
      dayData[`category_${usage.Category.id}`] = (dayData[`category_${usage.Category.id}`] || 0) + usage.value;
    });

    // Convert map to array
    const chartDataArray = Array.from(dateMap.values());

    // Get available categories for this user
    const availableCategories = await Category.findAll({
      where: { userId },
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