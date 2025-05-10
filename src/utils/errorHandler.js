/**
 * Error handling utility functions
 */

// Custom API error class
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handler for catching async errors
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

// Error response formatter
const formatErrorResponse = (err, req, res) => {
  const { statusCode = 500, message } = err;
  
  // Default response structure
  const response = {
    status: 'error',
    message: statusCode === 500 ? 'Internal server error' : message
  };
  
  // Add more details in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.detail = err.message;
  }
  
  return res.status(statusCode).json(response);
};

module.exports = {
  ApiError,
  catchAsync,
  formatErrorResponse
};