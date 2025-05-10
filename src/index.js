// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes and middleware
const stockRoutes = require('./routes/stockRoutes');
const cacheMiddleware = require('./middleware/cache');
const requestLogger = require('./middleware/logger');
const { errorMiddleware } = require('./utils/errorHandler');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply global middleware
app.use(requestLogger);
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disable for simplicity in development
}));
app.use(compression()); // Compress all responses
app.use(express.json());

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Serve static files with cache control
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1m', // Cache static assets for 1 minute (reduced for development)
  etag: true,
}));

// API routes with caching
app.use('/api/stock', cacheMiddleware(5 * 60 * 1000), stockRoutes); // Cache for 5 minutes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorMiddleware);

// Start the server
app.listen(PORT, () => {
  console.log(`LightStock server running on port ${PORT}`);
});
