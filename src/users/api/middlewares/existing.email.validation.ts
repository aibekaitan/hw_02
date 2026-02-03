import { body } from 'express-validator';

export const existingEmailValidation = body('email')
  .isString()
  .trim()
  .isLength({ min: 1 })
  .isEmail()
  .withMessage('email is not correct');
