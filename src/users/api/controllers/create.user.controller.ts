import { NextFunction, Request, Response } from 'express';
import { usersQwRepository } from '../../infrastructure/user.query.repo';
import { RequestWithBody } from '../../../common/types/requests';
import { IUserView } from '../../types/user.view.interface';
import { usersService } from '../../domain/user.service';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { CreateUserDto } from '../../types/create-user.dto';

export const createUserController = async (
  req: RequestWithBody<CreateUserDto>,
  res: Response<IUserView>,
) => {
  const { login, password, email } = req.body;

  const userId = await usersService.create({ login, password, email });
  const newUser = await usersQwRepository.findById(userId);

  res.status(HttpStatuses.Created).send(newUser!);
};
