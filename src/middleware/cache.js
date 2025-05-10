const cache = require('memory-cache');

/**
 * Middleware to cache API responses
 * @param {number} duration - Cache duration in milliseconds
 * @returns {Function} Express middleware function
 */
function cacheMiddleware(duration) {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = cache.get(key);

    if (cachedBody) {
      // Set cache header
      res.set('X-Cache', 'HIT');
      return res.send(cachedBody);
    } else {
      // Store the original send method
      const originalSend = res.send;
      
      // Override the send method
      res.send = function(body) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.put(key, body, duration);
        }
        
        // Set cache header
        res.set('X-Cache', 'MISS');
        
        // Call the original send method
        return originalSend.call(this, body);
      };
      
      next();
    }
  };
}

module.exports = cacheMiddleware;
