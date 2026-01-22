import { IUserView, IUserView2 } from '../types/user.view.interface';
import { ObjectId, WithId } from 'mongodb';
import { IUserDB } from '../types/user.db.interface';
import { IPagination } from '../../common/types/pagination';
import { SortQueryFilterType } from '../../common/types/sortQueryFilter.type';
import { UserModel } from '../../models/user.model';
// import { db } from "../../db";
// import { usersCollection } from '../../db/collections';

export const usersQwRepository = {
  async findAllUsers(
    sortQueryDto: SortQueryFilterType,
  ): Promise<IPagination<IUserView[]>> {
    const {
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
      pageSize,
      pageNumber,
    } = sortQueryDto;

    const loginAndEmailFilter = {};
    const filter: any = {};
    const conds = [];

    if (searchLoginTerm) {
      conds.push({
        login: { $regex: searchLoginTerm, $options: 'i' },
      });
    }

    if (searchEmailTerm) {
      conds.push({
        email: { $regex: searchEmailTerm, $options: 'i' },
      });
    }

    if (conds.length > 0) filter.$or = conds;

    const totalCount = await UserModel.countDocuments(filter);

    const users = await UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-_id -__v')
      .lean();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: users.map((u) => this._getInView(u)),
    };
  },
  async findById(id: string): Promise<IUserView | null> {
    const user = await UserModel.findOne({ _id: new ObjectId(id) });
    return user ? this._getInView(user) : null;
  },
  async findById2(id: string): Promise<IUserView2 | null> {
    const user = await UserModel.findOne({ _id: new ObjectId(id) });
    return user ? this._getInView2(user) : null;
  },
  _getInView(user: WithId<IUserDB>): IUserView {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  },
  _getInView2(user: WithId<IUserDB>): IUserView2 {
    return {
      userId: user._id.toString(),
      login: user.login,
      email: user.email,
    };
  },
  _checkObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  },
};
