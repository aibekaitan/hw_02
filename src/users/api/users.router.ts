import { Router } from 'express';
import { baseAuthGuard } from '../../auth/api/guards/base.auth.guard';
import { pageNumberValidation } from '../../common/validation/sorting.pagination.validation';
import { emailValidation } from './middlewares/email.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { passwordValidation } from './middlewares/password.validation';
import { loginValidation } from './middlewares/login.validation';
import { getAllUsersController } from './controllers/get.users.controller';
import { createUserController } from './controllers/create.user.controller';
import { deleteUserController } from './controllers/delete.user.controller';

export const usersRouter = Router();

usersRouter.get(
  '/',
  baseAuthGuard,
  pageNumberValidation,
  getAllUsersController,
);

usersRouter.post(
  '/',
  baseAuthGuard,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  createUserController,
);

usersRouter.delete('/:id', baseAuthGuard, deleteUserController);
