import { body } from 'express-validator';
import { usersRepository } from '../../infrastructure/user.repository';

export const existingEmailValidation = body('email')
  .isString()
  .trim()
  .isLength({ min: 1 })
  .isEmail()
  .withMessage('email is not correct');
