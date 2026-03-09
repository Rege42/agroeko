import { logger } from '../logger/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid identifier format',
      errors: [
        {
          field: err.path,
          message: 'Invalid ObjectId format',
          value: err.value,
        },
      ],
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0];

    return res.status(409).json({
      success: false,
      message: 'Duplicate value error',
      errors: [
        {
          field: duplicateField,
          message: `Value for "${duplicateField}" already exists`,
        },
      ],
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: err.errors || [],
  });
};

export default errorHandler;