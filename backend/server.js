const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { User, Category, Device, Usage, Bill } = require('./models');
// const morgan = require('morgan'); // Optional: for logging HTTP requests

// Import routes
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const usageRoutes = require('./routes/usageRoutes');
const billRoutes = require('./routes/billRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const testRoutes = require('./routes/testRoutes');

require('dotenv').config(); // To use environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses urlencoded payloads
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Water Management App Backend Running!');
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/usages', usageRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/test', testRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Database initialization and server start
const startServer = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer(); 