import { WithId } from 'mongodb';
import { Result } from '../../common/result/result.type';
import { ResultStatus } from '../../common/result/resultCode';
import { jwtService } from '../adapters/jwt.service';
import { usersRepository } from '../../users/infrastructure/user.repository';
import { bcryptService } from '../adapters/bcrypt.service';
import { IUserDB } from '../../users/types/user.db.interface';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/emailExamples';
import { User } from '../../users/domain/user.entity';

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
  async registerUser(
    login: string,
    pass: string,
    email: string,
  ): Promise<Result<User | null>> {
    const user = await usersRepository.doesExistByLoginOrEmail(login, email);
    if (user)
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'loginOrEmail', message: 'Already Registered' }],
      };

    const passwordHash = await bcryptService.generateHash(pass);

    const newUser = new User(login, email, passwordHash);

    await usersRepository.create(newUser);

    nodemailerService
      .sendEmail(
        newUser.email,
        newUser.emailConfirmation.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((er) => console.error('error in send email:', er));

    return {
      status: ResultStatus.Success,
      data: newUser,
      extensions: [],
    };
  },

  async confirmEmail(code: string): Promise<Result<any>> {
    //some logic
    let user = await usersRepository.findUserByConfirmationCode(code);
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Incorrect code' }],
      };
    }
    const isUuid = new RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ).test(code);

    if (!isUuid) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'Bad Request',
        data: null,
        extensions: [{ field: 'code', message: 'Incorrect code' }],
      };
    }
    await usersRepository.updateConfirmation(user._id);
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },
};
