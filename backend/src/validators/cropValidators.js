import { body, query } from 'express-validator';
import { optionalStringField } from './commonValidators.js';

const CROP_TYPES = ['grain', 'legume', 'oilseed', 'technical', 'vegetable', 'forage', 'other'];
const SOIL_TYPES = ['chernozem', 'sandy', 'clay', 'loam', 'peat', 'saline', 'other'];

export const createCropValidator = [
  body('name')
    .notEmpty()
    .withMessage('Поле name обязательно')
    .bail()
    .isString()
    .withMessage('Поле name должно быть строкой')
    .bail()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Длина поля name должна быть от 2 до 120 символов'),

  body('type')
    .notEmpty()
    .withMessage('Поле type обязательно')
    .bail()
    .isIn(CROP_TYPES)
    .withMessage(`Поле type должно иметь одно из значений: ${CROP_TYPES.join(', ')}`),

  body('growthPeriodDays')
    .notEmpty()
    .withMessage('Поле growthPeriodDays обязательно')
    .bail()
    .isInt({ gt: 0 })
    .withMessage('Поле growthPeriodDays должно быть целым числом больше 0'),

  body('averageYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Поле averageYield должно быть числом, большим или равным 0'),

  body('yieldUnit')
    .optional()
    .isString()
    .withMessage('Поле yieldUnit должно быть строкой')
    .bail()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Длина поля yieldUnit не должна превышать 20 символов'),

  body('suitableSoilTypes')
    .optional()
    .isArray()
    .withMessage('Поле suitableSoilTypes должно быть массивом'),

  body('suitableSoilTypes.*')
    .optional()
    .isIn(SOIL_TYPES)
    .withMessage(`Каждое значение в suitableSoilTypes должно быть одним из: ${SOIL_TYPES.join(', ')}`),

  body('minRecommendedPh')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('Поле minRecommendedPh должно быть числом от 0 до 14'),

  body('maxRecommendedPh')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('Поле maxRecommendedPh должно быть числом от 0 до 14'),

  body().custom((value) => {
    if (
      value.minRecommendedPh !== undefined &&
      value.maxRecommendedPh !== undefined &&
      Number(value.minRecommendedPh) > Number(value.maxRecommendedPh)
    ) {
      throw new Error('Поле minRecommendedPh не может быть больше maxRecommendedPh');
    }

    return true;
  }),

  optionalStringField('notes', 2000),
];

export const updateCropValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Поле name должно быть строкой')
    .bail()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Длина поля name должна быть от 2 до 120 символов'),

  body('type')
    .optional()
    .isIn(CROP_TYPES)
    .withMessage(`Поле type должно иметь одно из значений: ${CROP_TYPES.join(', ')}`),

  body('growthPeriodDays')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Поле growthPeriodDays должно быть целым числом больше 0'),

  body('averageYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Поле averageYield должно быть числом, большим или равным 0'),

  body('yieldUnit')
    .optional()
    .isString()
    .withMessage('Поле yieldUnit должно быть строкой')
    .bail()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Длина поля yieldUnit не должна превышать 20 символов'),

  body('suitableSoilTypes')
    .optional()
    .isArray()
    .withMessage('Поле suitableSoilTypes должно быть массивом'),

  body('suitableSoilTypes.*')
    .optional()
    .isIn(SOIL_TYPES)
    .withMessage(`Каждое значение в suitableSoilTypes должно быть одним из: ${SOIL_TYPES.join(', ')}`),

  body('minRecommendedPh')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('Поле minRecommendedPh должно быть числом от 0 до 14'),

  body('maxRecommendedPh')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('Поле maxRecommendedPh должно быть числом от 0 до 14'),

  body().custom((value) => {
    if (
      value.minRecommendedPh !== undefined &&
      value.maxRecommendedPh !== undefined &&
      Number(value.minRecommendedPh) > Number(value.maxRecommendedPh)
    ) {
      throw new Error('Поле minRecommendedPh не может быть больше "maxRecommendedPh"');
    }

    return true;
  }),

  optionalStringField('notes', 2000),
];

export const listCropsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Параметр page должен быть целым числом больше 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Параметр limit должен быть целым числом от 1 до 100'),

  query('type')
    .optional()
    .isIn(CROP_TYPES)
    .withMessage(`Параметр type должен иметь одно из значений: ${CROP_TYPES.join(', ')}`),
];