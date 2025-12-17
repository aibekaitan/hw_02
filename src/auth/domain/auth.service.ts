import { WithId } from 'mongodb';
import { Result } from '../../common/result/result.type';
import { ResultStatus } from '../../common/result/resultCode';
import { jwtService } from '../adapters/jwt.service';
import { usersRepository } from '../../users/infrastructure/user.repository';
import { bcryptService } from '../adapters/bcrypt.service';
import { IUserDB } from '../../users/types/user.db.interface';

export const authService = {
  async loginUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<{ accessToken: string } | null>> {
    try {
      console.log('loginUser called with:', { loginOrEmail, password });

      const result = await this.checkUserCredentials(loginOrEmail, password);
      console.log('checkUserCredentials result:', result.status);

      if (result.status !== ResultStatus.Success) {
        console.log('Returning Unauthorized');
        return {
          status: ResultStatus.Unauthorized,
          errorMessage: 'Unauthorized',
          extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
          data: null,
        };
      }

      console.log('Creating token for user:', result.data!._id.toString());
      const accessToken = await jwtService.createToken(
        result.data!._id.toString(),
      );

      return {
        status: ResultStatus.Success,
        data: { accessToken },
        extensions: [],
      };
    } catch (error) {
      console.error('Error in loginUser:', error);
      throw error; // Это вызовет 500 ошибку
    }
  },

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<WithId<IUserDB> | null>> {
    try {
      console.log('checkUserCredentials:', loginOrEmail);

      const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
      console.log('User found:', user ? 'yes' : 'no');

      if (!user) {
        console.log('User not found');
        return {
          status: ResultStatus.NotFound,
          data: null,
          errorMessage: 'Not Found',
          extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
        };
      }

      console.log('Checking password...');
      const isPassCorrect = await bcryptService.checkPassword(
        password,
        user.passwordHash,
      );
      console.log('Password correct:', isPassCorrect);

      if (!isPassCorrect) {
        console.log('Password incorrect');
        return {
          status: ResultStatus.BadRequest,
          data: null,
          errorMessage: 'Bad Request',
          extensions: [{ field: 'password', message: 'Wrong password' }],
        };
      }

      console.log('Credentials valid');
      return {
        status: ResultStatus.Success,
        data: user,
        extensions: [],
      };
    } catch (error) {
      console.error('Error in checkUserCredentials:', error);
      throw error;
    }
  },
};
