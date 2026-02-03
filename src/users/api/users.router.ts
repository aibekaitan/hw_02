import { Router } from 'express';
import { baseAuthGuard } from '../../auth/api/guards/base.auth.guard';
import { pageNumberValidation } from '../../common/validation/sorting.pagination.validation';
import { emailValidation } from './middlewares/email.validation';
import { inputValidation } from '../../common/validation/input.validation';
import { passwordValidation } from './middlewares/password.validation';
import { loginValidation } from './middlewares/login.validation';
import { container } from '../../composition-root';
import { UserController } from './users.controller';
const userControllerInstance = container.get(UserController);
export const usersRouter = Router();

usersRouter.get(
  '/',
  baseAuthGuard,
  pageNumberValidation,
  userControllerInstance.getAllUsers.bind(userControllerInstance),
);

usersRouter.post(
  '/',
  baseAuthGuard,
  passwordValidation,
  loginValidation,
  emailValidation,
  inputValidation,
  userControllerInstance.createUser.bind(userControllerInstance),
);

usersRouter.delete(
  '/:id',
  baseAuthGuard,
  userControllerInstance.deleteUser.bind(userControllerInstance),
);
