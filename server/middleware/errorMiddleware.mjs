import { validationResult } from 'express-validator';

export const errorHandler = (err, req, res, next) => {
  console.error('Error in error handler:', err);
  
  // Handle validation errors from express-validator
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).json({
      success: false, // Always set success: false
      message: 'Validation failed', // Add a validation message
      errors: validationErrors.array(),
    });
  }

  // Handle other errors (including not found and internal errors)
  const statusCode = err.statusCode || 500;  // Default to 500 if no statusCode is set
  res.status(statusCode).json({
    success: false,  // Ensure success is always false
    message: err.message || 'An unknown error occurred', // Provide a default message if none exists
  });
};
