import { Response } from 'express';
import { UserService } from '../domain/user.service';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithQuery,
} from '../../common/types/requests';
import { UsersQueryFieldsType } from '../types/users.queryFields.type';
import { IPagination } from '../../common/types/pagination';
import { IUserView } from '../types/user.view.interface';
import { CreateUserDto } from '../types/create-user.dto';
import { HttpStatuses } from '../../common/types/httpStatuses';
import { IdType } from '../../common/types/id';
import { ObjectId } from 'mongodb';

export class UserController {
  constructor(protected userService: UserService) {}
  async getAllUsers(
    req: RequestWithQuery<UsersQueryFieldsType>,
    res: Response<IPagination<IUserView[]>>,
  ) {
    const allUsers = await this.userService.getAllUsers(req.query);
    res.status(HttpStatuses.Success).send(allUsers);
  }

  async createUser(
    req: RequestWithBody<CreateUserDto>,
    res: Response<IUserView>,
  ) {
    const newUser = await this.userService.create(req.body);
    res.status(HttpStatuses.Created).send(newUser);
  }

  async deleteUser(req: RequestWithParams<IdType>, res: Response<string>) {
    if (!ObjectId.isValid(req.params.id)) {
      res.sendStatus(404);
      return;
    }
    const user = await this.userService.delete(req.params.id);

    if (!user) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  }
}
