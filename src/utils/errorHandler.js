/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether this is an operational error
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Helper function to create specific error types
 */
const createError = {
  badRequest: (message = 'Bad Request') => 
    new ApiError(message, 400),
  
  unauthorized: (message = 'Unauthorized') => 
    new ApiError(message, 401),
  
  forbidden: (message = 'Forbidden') => 
    new ApiError(message, 403),
  
  notFound: (message = 'Resource not found') => 
    new ApiError(message, 404),
  
  tooManyRequests: (message = 'Too many requests, please try again later') => 
    new ApiError(message, 429),
  
  internal: (message = 'Internal Server Error', isOperational = true) => 
    new ApiError(message, 500, isOperational)
};

/**
 * Global error handler middleware
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // Log error details
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  if (!err.isOperational) {
    console.error(err.stack);
  }
  
  // Prepare the response
  const errorResponse = {
    error: statusCode === 500 ? 'Internal Server Error' : message,
    status: statusCode
  };
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = {
  ApiError,
  createError,
  errorMiddleware
};
