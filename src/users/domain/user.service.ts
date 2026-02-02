import {
  UserRepository,
  usersRepository,
} from '../infrastructure/user.repository';
import { BcryptService } from '../../auth/adapters/bcrypt.service';
import { IUserDB } from '../types/user.db.interface';
import { CreateUserDto } from '../types/create-user.dto';
import { UserQueryRepo } from '../infrastructure/user.query.repo';
import { IUserView } from '../types/user.view.interface';
import { UsersQueryFieldsType } from '../types/users.queryFields.type';
import { IPagination } from '../../common/types/pagination';
import { sortQueryFieldsUtil } from '../../common/utils/sortQueryFields.util';

export class UserService {
  private userRepository: UserRepository;
  private userQwRepository: UserQueryRepo;
  private bcryptService: BcryptService;

  constructor() {
    this.userRepository = new UserRepository();
    this.userQwRepository = new UserQueryRepo();
    this.bcryptService = new BcryptService();
  }

  async getAllUsers(
    query: UsersQueryFieldsType,
  ): Promise<IPagination<IUserView[]>> {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      sortQueryFieldsUtil(query);

    return this.userQwRepository.findAllUsers({
      searchLoginTerm: query.searchLoginTerm,
      searchEmailTerm: query.searchEmailTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    });
  }

  async create(dto: CreateUserDto): Promise<IUserView> {
    const { login, password, email } = dto;
    const passwordHash = await this.bcryptService.generateHash(password);

    const newUser: IUserDB = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
      refreshToken: '',
      passwordRecoveryCode: '',
      emailConfirmation: {
        confirmationCode: '',
        isConfirmed: true,
        expirationDate: new Date(),
      },
    };

    const userId = await this.userRepository.create(newUser);

    const userView = await this.userQwRepository.findById(userId);

    if (!userView) {
      throw new Error('User not found after creation'); // на случай редкой ошибки
    }

    return userView;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    if (!user) return false;

    return await this.userRepository.delete(id);
  }
}
