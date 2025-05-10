const cache = require('memory-cache');
const dotenv = require('dotenv');

// Make sure environment variables are loaded
dotenv.config();

/**
 * Cache service for storing API responses
 */
class CacheService {
  constructor() {
    this.DEFAULT_TTL = parseInt(process.env.CACHE_DURATION) || 5 * 60 * 1000; // Default: 5 minutes
    console.log(`Cache service initialized with TTL: ${this.DEFAULT_TTL}ms`);
  }

  /**
   * Store data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to store
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, data, ttl = this.DEFAULT_TTL) {
    if (!key) return;
    cache.put(key, data, parseInt(ttl));
  }

  /**
   * Retrieve data from cache
   * @param {string} key - Cache key
   * @returns {any} - Cached data or null if not found
   */
  get(key) {
    if (!key) return null;
    return cache.get(key);
  }

  /**
   * Remove specific item from cache
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    if (!key) return;
    cache.del(key);
  }

  /**
   * Clear all cached data
   */
  clear() {
    cache.clear();
  }
  
  /**
   * Get cache stats
   * @returns {Object} - Cache statistics
   */
  getStats() {
    return {
      size: cache.size(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      keys: cache.keys()
    };
  }

  /**
   * Create middleware for caching API responses
   * @param {number} duration - Cache duration in milliseconds (optional)
   * @returns {Function} - Express middleware
   */
  middleware(duration) {
    return (req, res, next) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Create a cache key from the request URL and query parameters
      const key = `api:${req.originalUrl || req.url}`;
      const cachedResponse = this.get(key);

      if (cachedResponse) {
        // Add cache header for transparency
        res.set('X-Cache', 'HIT');
        return res.send(cachedResponse);
      }

      // Override res.send to cache the response before sending
      const originalSend = res.send;
      res.send = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(key, body, duration || this.DEFAULT_TTL);
        }
        // Add cache header for transparency
        res.set('X-Cache', 'MISS');
        originalSend.call(res, body);
      };

      next();
    };
  }
}

// Export as singleton
module.exports = new CacheService();