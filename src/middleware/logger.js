/**
 * Simple request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestLogger(req, res, next) {
  // Skip logging for static assets in production
  if (process.env.NODE_ENV === 'production' && req.path.startsWith('/static')) {
    return next();
  }

  const start = Date.now();
  const { method, path, query, body } = req;
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${method} ${path}`);
  
  // Log when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    console.log(`[${new Date().toISOString()}] ${method} ${path} ${statusCode} - ${duration}ms`);
  });
  
  next();
}

module.exports = requestLogger;
