import { body, query } from 'express-validator';
import {
  requiredStringField,
  optionalStringField,
  positiveNumberField,
  enumField,
} from './commonValidators.js';

const SOIL_TYPES = ['chernozem', 'sandy', 'clay', 'loam', 'peat', 'saline', 'other'];
const MOISTURE_LEVELS = ['low', 'medium', 'high'];

export const createFieldValidator = [
  requiredStringField('name', 2, 120),
  positiveNumberField('area'),
  enumField('soilType', SOIL_TYPES, true),
  enumField('moistureLevel', MOISTURE_LEVELS, false),
  optionalStringField('location', 255),
  optionalStringField('cadastralNumber', 64),
  optionalStringField('notes', 2000),
];

export const updateFieldValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Поле name должно быть строкой')
    .bail()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Длина поля name должна быть от 2 до 120 символов'),

  body('area')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Поле area должно быть числом больше 0'),

  body('soilType')
    .optional()
    .isIn(SOIL_TYPES)
    .withMessage(`Поле soilType должно иметь одно из значений: ${SOIL_TYPES.join(', ')}`),

  body('moistureLevel')
    .optional()
    .isIn(MOISTURE_LEVELS)
    .withMessage(`Поле moistureLevel должно иметь одно из значений: ${MOISTURE_LEVELS.join(', ')}`),

  optionalStringField('location', 255),
  optionalStringField('cadastralNumber', 64),
  optionalStringField('notes', 2000),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Поле isActive должно быть логическим значением'),
];

export const listFieldsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Параметр page должен быть целым числом больше 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Параметр limit должен быть целым числом от 1 до 100'),

  query('soilType')
    .optional()
    .isIn(SOIL_TYPES)
    .withMessage(`Параметр soilType должен иметь одно из значений: ${SOIL_TYPES.join(', ')}`),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('Параметр isActive должен быть логическим значением'),
];