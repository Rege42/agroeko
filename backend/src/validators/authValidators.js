import { body } from 'express-validator';

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Некорректный email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
];