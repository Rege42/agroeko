import { body, query } from 'express-validator';
import { Field, Crop, CropRotationEntry } from '../models/index.js';
import mongoose from 'mongoose';

const SEASON_STATUSES = ['planned', 'active', 'harvested', 'closed'];

const validateObjectIdValue = (value) => mongoose.Types.ObjectId.isValid(value);

export const createCropRotationEntryValidator = [
  body('field')
    .notEmpty()
    .withMessage('Поле "field" обязательно')
    .bail()
    .custom((value) => validateObjectIdValue(value))
    .withMessage('Поле "field" должно быть корректным ObjectId')
    .bail()
    .custom(async (value) => {
      const field = await Field.findById(value);
      if (!field) {
        throw new Error('Поле не найдено');
      }
      return true;
    }),

  body('crop')
    .notEmpty()
    .withMessage('Поле "crop" обязательно')
    .bail()
    .custom((value) => validateObjectIdValue(value))
    .withMessage('Поле "crop" должно быть корректным ObjectId')
    .bail()
    .custom(async (value) => {
      const crop = await Crop.findById(value);
      if (!crop) {
        throw new Error('Культура не найдена');
      }
      return true;
    }),

  body('seasonYear')
    .notEmpty()
    .withMessage('Поле "seasonYear" обязательно')
    .bail()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Поле "seasonYear" должно быть целым числом в диапазоне от 2000 до 2100'),

  body('sowingDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Поле "sowingDate" должно содержать корректную дату в формате ISO 8601')
    .toDate(),

  body('harvestDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Поле "harvestDate" должно содержать корректную дату в формате ISO 8601')
    .toDate(),

  body('predictedYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Поле "predictedYield" должно быть числом, большим или равным 0'),

  body('finalYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Поле "finalYield" должно быть числом, большим или равным 0'),

  body('yieldUnit')
    .optional()
    .isString()
    .withMessage('Поле "yieldUnit" должно быть строкой')
    .bail()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Длина поля "yieldUnit" не должна превышать 20 символов'),

  body('seasonStatus')
    .optional()
    .isIn(SEASON_STATUSES)
    .withMessage(`Поле "seasonStatus" должно иметь одно из значений: ${SEASON_STATUSES.join(', ')}`),

  body('notes')
    .optional()
    .isString()
    .withMessage('Поле "notes" должно быть строкой')
    .bail()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Длина поля "notes" не должна превышать 3000 символов'),

  body().custom(async (value) => {
    if (value.sowingDate && value.harvestDate) {
      const sowingDate = new Date(value.sowingDate);
      const harvestDate = new Date(value.harvestDate);

      if (harvestDate < sowingDate) {
        throw new Error('Дата уборки не может быть раньше даты посева');
      }
    }

    return true;
  }),

  body().custom(async (value) => {
    if (!value.field || !value.seasonYear) {
      return true;
    }

    const existingEntry = await CropRotationEntry.findOne({
      field: value.field,
      seasonYear: value.seasonYear,
    });

    if (existingEntry) {
      throw new Error('Запись севооборота для этого поля и сезона уже существует');
    }

    return true;
  }),

  body().custom(async (value) => {
    if (!value.field || !value.crop) {
      return true;
    }

    const [field, crop] = await Promise.all([
      Field.findById(value.field),
      Crop.findById(value.crop),
    ]);

    if (!field || !crop) {
      return true;
    }

    if (
      Array.isArray(crop.suitableSoilTypes) &&
      crop.suitableSoilTypes.length > 0 &&
      !crop.suitableSoilTypes.includes(field.soilType)
    ) {
      throw new Error('Выбранная культура не подходит для типа почвы данного поля');
    }

    return true;
  }),
];

export const updateCropRotationEntryValidator = [
  body('field')
    .optional()
    .custom((value) => validateObjectIdValue(value))
    .withMessage('Поле "field" должно быть корректным ObjectId')
    .bail()
    .custom(async (value) => {
      const field = await Field.findById(value);
      if (!field) {
        throw new Error('Поле не найдено');
      }
      return true;
    }),

  body('crop')
    .optional()
    .custom((value) => validateObjectIdValue(value))
    .withMessage('Поле "crop" должно быть корректным ObjectId')
    .bail()
    .custom(async (value) => {
      const crop = await Crop.findById(value);
      if (!crop) {
        throw new Error('Культура не найдена');
      }
      return true;
    }),

  body('seasonYear')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Поле "seasonYear" должно быть целым числом в диапазоне от 2000 до 2100'),

  body('sowingDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Поле "sowingDate" должно содержать корректную дату в формате ISO 8601')
    .toDate(),

  body('harvestDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Поле "harvestDate" должно содержать корректную дату в формате ISO 8601')
    .toDate(),

  body('predictedYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Поле "predictedYield" должно быть числом, большим или равным 0'),

  body('finalYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Поле "finalYield" должно быть числом, большим или равным 0'),

  body('yieldUnit')
    .optional()
    .isString()
    .withMessage('Поле "yieldUnit" должно быть строкой')
    .bail()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Длина поля "yieldUnit" не должна превышать 20 символов'),

  body('seasonStatus')
    .optional()
    .isIn(SEASON_STATUSES)
    .withMessage(`Поле "seasonStatus" должно иметь одно из значений: ${SEASON_STATUSES.join(', ')}`),

  body('notes')
    .optional()
    .isString()
    .withMessage('Поле "notes" должно быть строкой')
    .bail()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Длина поля "notes" не должна превышать 3000 символов'),

  body().custom(async (value, { req }) => {
    const currentEntry = await CropRotationEntry.findById(req.params.id);

    if (!currentEntry) {
      return true;
    }

    const sowingDate = value.sowingDate ? new Date(value.sowingDate) : currentEntry.sowingDate;
    const harvestDate = value.harvestDate ? new Date(value.harvestDate) : currentEntry.harvestDate;

    if (sowingDate && harvestDate && harvestDate < sowingDate) {
      throw new Error('Дата уборки не может быть раньше даты посева');
    }

    return true;
  }),

  body().custom(async (value, { req }) => {
    const currentEntry = await CropRotationEntry.findById(req.params.id);

    if (!currentEntry) {
      return true;
    }

    const fieldId = value.field || currentEntry.field.toString();
    const seasonYear = value.seasonYear || currentEntry.seasonYear;

    const existingEntry = await CropRotationEntry.findOne({
      _id: { $ne: req.params.id },
      field: fieldId,
      seasonYear,
    });

    if (existingEntry) {
      throw new Error('Запись севооборота для этого поля и сезона уже существует');
    }

    return true;
  }),

  body().custom(async (value, { req }) => {
    const currentEntry = await CropRotationEntry.findById(req.params.id).populate('field crop');

    if (!currentEntry) {
      return true;
    }

    const field = value.field
      ? await Field.findById(value.field)
      : currentEntry.field;

    const crop = value.crop
      ? await Crop.findById(value.crop)
      : currentEntry.crop;

    if (!field || !crop) {
      return true;
    }

    if (
      Array.isArray(crop.suitableSoilTypes) &&
      crop.suitableSoilTypes.length > 0 &&
      !crop.suitableSoilTypes.includes(field.soilType)
    ) {
      throw new Error('Выбранная культура не подходит для типа почвы данного поля');
    }

    return true;
  }),
];

export const listCropRotationEntriesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Параметр "page" должен быть целым числом больше 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Параметр "limit" должен быть целым числом от 1 до 100'),

  query('field')
    .optional()
    .custom((value) => validateObjectIdValue(value))
    .withMessage('Параметр "field" должен быть корректным ObjectId'),

  query('crop')
    .optional()
    .custom((value) => validateObjectIdValue(value))
    .withMessage('Параметр "crop" должен быть корректным ObjectId'),

  query('seasonYear')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Параметр "seasonYear" должен быть целым числом в диапазоне от 2000 до 2100'),

  query('seasonStatus')
    .optional()
    .isIn(SEASON_STATUSES)
    .withMessage(`Параметр "seasonStatus" должен иметь одно из значений: ${SEASON_STATUSES.join(', ')}`),
];