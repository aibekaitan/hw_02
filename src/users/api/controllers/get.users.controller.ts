import { NextFunction, Request, Response } from 'express';
import { sortQueryFieldsUtil } from '../../../common/utils/sortQueryFields.util';
import { usersQwRepository } from '../../infrastructure/user.query.repo';
import { RequestWithQuery } from '../../../common/types/requests';
import { UsersQueryFieldsType } from '../../types/users.queryFields.type';
import { IPagination } from '../../../common/types/pagination';
import { IUserView } from '../../types/user.view.interface';

export const getAllUsersController = async (
  req: RequestWithQuery<UsersQueryFieldsType>,
  res: Response<IPagination<IUserView[]>>,
) => {
  const { pageNumber, pageSize, sortBy, sortDirection } = sortQueryFieldsUtil(
    req.query,
  );
  const allUsers = await usersQwRepository.findAllUsers({
    searchLoginTerm: req.query.searchLoginTerm,
    searchEmailTerm: req.query.searchEmailTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  });

  res.status(200).send(allUsers);
};
