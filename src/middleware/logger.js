const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Make sure environment variables are loaded
dotenv.config();

// Define log directory
const LOG_DIR = path.join(__dirname, '../../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating logs directory:', err);
  }
}

/**
 * Format log message
 * @private
 * @param {Object} data - Log data
 * @returns {string} - Formatted log message
 */
const formatLogMessage = (data) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * Write log to file in production
 * @private
 * @param {string} filename - Log filename
 * @param {Object} data - Log data
 */
const writeToFile = (filename, data) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      fs.appendFileSync(
        path.join(LOG_DIR, filename),
        formatLogMessage(data) + '\n'
      );
    } catch (err) {
      console.error('Error writing to log file:', err);
    }
  }
};

/**
 * Log incoming requests and responses
 * @returns {Function} - Express middleware
 */
const requestLogger = () => {
  return (req, res, next) => {
    // Get request start time
    const start = Date.now();
    
    // Create initial log data
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };
    
    // Log request details to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    }
    
    // Override end method to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      // Calculate request duration
      const duration = Date.now() - start;
      
      // Add response details to log data
      logData.status = res.statusCode;
      logData.duration = `${duration}ms`;
      
      // Log response to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
      }
      
      // Write to file in production
      writeToFile('access.log', logData);
      
      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

/**
 * Log errors
 * @returns {Function} - Express error middleware
 */
const errorLogger = () => {
  return (err, req, res, next) => {
    // Create error log data
    const errorData = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      error: {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
        status: err.statusCode || 500
      }
    };
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${new Date().toISOString()}] ERROR:`, err);
    }
    
    // Write to file
    writeToFile('error.log', errorData);
    
    next(err);
  };
};

/**
 * Log API usage statistics
 * @param {Object} cacheService - Cache service instance
 * @returns {Function} - Express middleware
 */
const apiUsageLogger = (cacheService) => {
  // Log API usage statistics every 5 minutes
  const INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  // Start interval timer
  setInterval(() => {
    // Get cache stats
    const stats = cacheService ? cacheService.getStats() : { size: 0 };
    
    // Create stats log data
    const statsData = {
      type: 'api_usage',
      cacheSize: stats.size,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100, // MB rounded to 2 decimal places
      uptime: Math.round(process.uptime() / 60) // minutes
    };
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] API STATS:`, statsData);
    }
    
    // Write to file
    writeToFile('stats.log', statsData);
  }, INTERVAL);
  
  // Return no-op middleware
  return (req, res, next) => next();
};

module.exports = {
  requestLogger,
  errorLogger,
  apiUsageLogger
};