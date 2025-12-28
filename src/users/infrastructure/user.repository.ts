import { ObjectId, UpdateResult, WithId } from 'mongodb';
import { IUserDB } from '../types/user.db.interface';
// import { db } from '../../db';
import { usersCollection } from '../../db/collections';
import { User } from '../domain/user.entity';
export const usersRepository = {
  async create(user: User): Promise<string> {
    const newUser = await usersCollection.insertOne({ ...user });
    return newUser.insertedId.toString();
  },
  async delete(id: string): Promise<boolean> {
    const isDel = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<WithId<User> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  },
  async updateRefreshToken(userId: string, token: string): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { refreshToken: token } },
    );
  },
  async findUserByConfirmationCode(
    emailConfirmationCode: string,
  ): Promise<WithId<User> | null> {
    return usersCollection.findOne({
      'emailConfirmation.confirmationCode': emailConfirmationCode,
    });
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
    return usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },
  async updateConfirmation(_id: ObjectId): Promise<UpdateResult<User> | null> {
    return usersCollection.updateOne(
      { _id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
  },
  async updateConfirmationCode(
    _id: ObjectId,
    newCode: string,
  ): Promise<UpdateResult<User>> {
    return usersCollection.updateOne(
      { _id },
      { $set: { 'emailConfirmation.confirmationCode': newCode } },
    );
  },
  async doesExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<boolean> {
    const user = await usersCollection.findOne({
      $or: [{ email }, { login }],
    });
    return !!user;
  },
};
