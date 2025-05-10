const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression()); // Compress all responses
app.use(cors()); // Enable CORS for all requests
app.use(helmet({ contentSecurityPolicy: false })); // Set security headers

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Import routes and middleware
const stockRoutes = require('./routes/stockRoutes');
const { requestLogger, errorLogger, apiUsageLogger } = require('./middleware/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const cacheService = require('./middleware/cache');

// Apply request logger
app.use(requestLogger());

// Initialize API usage logger
app.use(apiUsageLogger(cacheService));

// Apply global rate limiter to all API routes
app.use('/api', apiLimiter);

// Register API routes
app.use('/api', stockRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LightStock API is running' });
});

// Simple fallback route handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Apply error logger middleware
app.use(errorLogger());

// Error handling middleware
app.use((err, req, res, next) => {
  // Set status code (default to 500 if not set)
  const statusCode = err.statusCode || 500;
  
  // Create error response
  const errorResponse = {
    error: statusCode === 500 ? 'An unexpected error occurred' : err.message,
  };
  
  // Add more details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.detail = err.message;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
});

// Start the server
app.listen(PORT, () => {
  console.log(`LightStock server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // Export for testing