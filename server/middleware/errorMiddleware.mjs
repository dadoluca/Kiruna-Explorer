import { validationResult } from 'express-validator';

export const errorHandler = (err, req, res, next) => {
  // Handle validation errors from express-validator
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).json({
      success: false, // Add success: false here
      errors: validationErrors.array(),
    });
  }

  // Handle other errors
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false, // Ensure success is always set to false
    message: err.message || 'An unknown error occurred',
  });
};
