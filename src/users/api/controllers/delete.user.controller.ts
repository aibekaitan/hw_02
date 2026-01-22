import { NextFunction, Request, Response } from 'express';
import { RequestWithParams } from '../../../common/types/requests';
import { usersService } from '../../domain/user.service';
import { ObjectId } from 'mongodb';
import { IdType } from '../../../common/types/id';

export const deleteUserController = async (
  req: RequestWithParams<IdType>,
  res: Response<string>,
) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.sendStatus(404);
    return;
  }
  const user = await usersService.delete(req.params.id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  res.sendStatus(204);
};
