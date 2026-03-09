import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';

export const objectIdField = (fieldName, location = 'body') => {
  const validatorMap = {
    body,
    param,
    query,
  };

  return validatorMap[location](fieldName)
    .notEmpty()
    .withMessage(`Поле ${fieldName} обязательно`)
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(`Поле ${fieldName} должно быть корректным ObjectId`);
};

export const requiredStringField = (fieldName, min = 1, max = 255) =>
  body(fieldName)
    .notEmpty()
    .withMessage(`Поле ${fieldName} обязательно`)
    .bail()
    .isString()
    .withMessage(`Поле ${fieldName} должно быть строкой`)
    .bail()
    .trim()
    .isLength({ min, max })
    .withMessage(`Длина поля ${fieldName} должна быть от ${min} до ${max} символов`);

export const optionalStringField = (fieldName, max = 255) =>
  body(fieldName)
    .optional({ nullable: true })
    .isString()
    .withMessage(`Поле ${fieldName} должно быть строкой`)
    .bail()
    .trim()
    .isLength({ max })
    .withMessage(`Длина поля ${fieldName} не должна превышать ${max} символов`);

export const positiveNumberField = (fieldName) =>
  body(fieldName)
    .notEmpty()
    .withMessage(`Поле ${fieldName} обязательно`)
    .bail()
    .isFloat({ gt: 0 })
    .withMessage(`Поле ${fieldName} должно быть числом больше 0`);

export const nonNegativeNumberField = (fieldName) =>
  body(fieldName)
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage(`Поле ${fieldName} должно быть числом, большим или равным 0`);

export const integerYearField = (fieldName) =>
  body(fieldName)
    .notEmpty()
    .withMessage(`Поле ${fieldName} обязательно`)
    .bail()
    .isInt({ min: 2000, max: 2100 })
    .withMessage(`Поле ${fieldName} должно быть целым числом в диапазоне от 2000 до 2100`);

export const optionalDateField = (fieldName) =>
  body(fieldName)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage(`Поле ${fieldName} должно содержать корректную дату в формате ISO 8601`)
    .toDate();

export const requiredDateField = (fieldName) =>
  body(fieldName)
    .notEmpty()
    .withMessage(`Поле ${fieldName} обязательно`)
    .bail()
    .isISO8601()
    .withMessage(`Поле ${fieldName} должно содержать корректную дату в формате ISO 8601`)
    .toDate();

export const enumField = (fieldName, allowedValues, isRequired = true) => {
  const chain = body(fieldName);

  if (isRequired) {
    chain.notEmpty().withMessage(`Поле ${fieldName} обязательно`).bail();
  } else {
    chain.optional({ nullable: true });
  }

  return chain
    .isIn(allowedValues)
    .withMessage(`Поле ${fieldName} должно иметь одно из значений: ${allowedValues.join(', ')}`);
};