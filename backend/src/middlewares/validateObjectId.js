import mongoose from 'mongoose';

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: [
          {
            field: paramName,
            message: `Invalid ObjectId for parameter "${paramName}"`,
            value,
          },
        ],
      });
    }

    next();
  };
};

export default validateObjectId;