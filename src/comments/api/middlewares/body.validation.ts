import { body } from 'express-validator';

export const bodyValidation = body('content')
  .isString()
  .trim()
  .isLength({ min: 20, max: 300 })
  .withMessage('content is not correct');
