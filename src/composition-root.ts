import 'reflect-metadata';
import { AuthService } from './auth/domain/auth.service';
import { DevicesRepository } from './security-devices/infrastructure/security-devices.repository';
import { JwtService } from './auth/adapters/jwt.service';
import { UserRepository } from './users/infrastructure/user.repository';
import { NodemailerService } from './auth/adapters/nodemailer.service';
import { BcryptService } from './auth/adapters/bcrypt.service';
import { UserQueryRepo } from './users/infrastructure/user.query.repo';
import { BlogRepository } from './blogs/repositories/blogs-repository';
import { BlogService } from './blogs/domain/blogs-service';
import { CommentRepository } from './comments/infrastructure/comments.repository';
import { CommentService } from './comments/domain/comments.service';
import { PostQueryRepository } from './posts/repositories/post.query.repository';
import { PostRepository } from './posts/repositories/posts-repository';
import { PostService } from './posts/domain/post.service';
import { SecurityDevicesQueryRepository } from './security-devices/infrastructure/security-devices.query.repository';
import { SecurityDevicesService } from './security-devices/domain/security-devices.service';
import { UserService } from './users/domain/user.service';
import { AuthController } from './auth/api/auth.controller';
import { BlogController } from './blogs/routers/blogs.controller';
import { SecurityDevicesController } from './security-devices/api/devices.controller';
import { PostController } from './posts/routers/posts.controller';
import { CommentController } from './comments/api/comments.controller';
import { UserController } from './users/api/users.controller';
import { Container } from 'inversify';

export const securityDevicesRepository = new DevicesRepository();
export const jwtService = new JwtService();
export const usersRepository = new UserRepository();
export const container = new Container();
container.bind<DevicesRepository>(DevicesRepository).to(DevicesRepository);
container.bind<JwtService>(JwtService).to(JwtService);
container.bind<UserRepository>(UserRepository).to(UserRepository);
container.bind<NodemailerService>(NodemailerService).to(NodemailerService);
container.bind<BcryptService>(BcryptService).to(BcryptService);
container.bind<UserQueryRepo>(UserQueryRepo).to(UserQueryRepo);
container.bind<AuthService>(AuthService).to(AuthService);
container.bind<AuthController>(AuthController).to(AuthController);

container.bind<BlogRepository>(BlogRepository).to(BlogRepository);
container.bind<BlogService>(BlogService).to(BlogService);
container.bind<BlogController>(BlogController).to(BlogController);

container.bind<CommentRepository>(CommentRepository).to(CommentRepository);
container
  .bind<PostQueryRepository>(PostQueryRepository)
  .to(PostQueryRepository);
container.bind<CommentService>(CommentService).to(CommentService);
container.bind<CommentController>(CommentController).to(CommentController);
container.bind<PostRepository>(PostRepository).to(PostRepository);
container.bind<PostService>(PostService).to(PostService);
container.bind<PostController>(PostController).to(PostController);
container
  .bind<SecurityDevicesQueryRepository>(SecurityDevicesQueryRepository)
  .to(SecurityDevicesQueryRepository);
container
  .bind<SecurityDevicesService>(SecurityDevicesService)
  .to(SecurityDevicesService);
container
  .bind<SecurityDevicesController>(SecurityDevicesController)
  .to(SecurityDevicesController);
container.bind<UserService>(UserService).to(UserService);
container.bind<UserController>(UserController).to(UserController);

export const postRepository = new PostRepository(usersRepository);
