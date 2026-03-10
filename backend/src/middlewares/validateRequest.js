import { validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
    value: error.value,
  }));

  return res.status(400).json({
    success: false,
    message: 'Validation error',
    errors,
  });
};

export default validateRequest;