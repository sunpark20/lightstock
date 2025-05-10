const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter with custom settings
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests per window
 * @param {string} message - Error message when limit is exceeded
 * @returns {Function} - Express middleware
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

// General API rate limiter (less strict)
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests. Please try again later.'
);

// Search endpoint rate limiter (more strict)
const searchLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  20, // 20 requests per window
  'Too many search requests. Please try again later.'
);

// Stock details endpoint rate limiter
const stockLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  30, // 30 requests per window
  'Too many stock detail requests. Please try again later.'
);

module.exports = {
  apiLimiter,
  searchLimiter,
  stockLimiter
};