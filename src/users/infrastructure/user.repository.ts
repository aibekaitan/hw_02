import { ObjectId, UpdateResult, WithId } from 'mongodb';
import { IUserDB } from '../types/user.db.interface';
// import { db } from '../../db';
// import { usersCollection } from '../../db/collections';
import { User } from '../domain/user.entity';
import { UserModel } from '../../models/user.model';

export const usersRepository = {
  async create(user: User): Promise<string> {
    const newUser = await UserModel.create({ ...user });
    return newUser._id.toString();
  },
  async delete(id: string): Promise<boolean> {
    const isDel = await UserModel.deleteOne({ id });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<WithId<User> | null> {
    return UserModel.findById(id).select('-_id -__v').lean();
  },
  async updateRefreshToken(userId: string, token: string): Promise<void> {
    await UserModel.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { refreshToken: token } },
    );
  },
  async findUserByConfirmationCode(
    emailConfirmationCode: string,
  ): Promise<WithId<User> | null> {
    return UserModel.findOne({
      'emailConfirmation.confirmationCode': emailConfirmationCode,
    })
      .select('-_id -__v')
      .lean();
  },
  async findUserByPasswordRecoveryCode(
    passwordRecoveryCode: string,
  ): Promise<WithId<User> | null> {
    return UserModel.findOne({
      passwordRecoveryCode: passwordRecoveryCode,
    })
      .select('-_id -__v')
      .lean();
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
    return UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    })
      .select('-_id -__v')
      .lean();
  },
  async updateConfirmation(_id: ObjectId): Promise<UpdateResult<User> | null> {
    return UserModel.updateOne(
      { _id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
  },
  async updatePassword(
    _id: ObjectId,
    newPassword: string,
  ): Promise<UpdateResult<User> | null> {
    return UserModel.updateOne(
      { _id },
      { $set: { passwordHash: newPassword } },
    );
  },
  async updatePasswordRecoveryCode(
    _id: ObjectId,
    newCode: string,
  ): Promise<UpdateResult<User>> {
    return UserModel.updateOne(
      { _id },
      { $set: { passwordRecoveryCode: newCode } },
    );
  },
  async updateConfirmationCode(
    _id: ObjectId,
    newCode: string,
  ): Promise<UpdateResult<User>> {
    return UserModel.updateOne(
      { _id },
      { $set: { 'emailConfirmation.confirmationCode': newCode } },
    );
  },
  async doesExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<boolean> {
    const user = await UserModel.findOne({
      $or: [{ email }, { login }],
    }).lean();
    return !!user;
  },
};
