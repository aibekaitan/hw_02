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

export const securityDevicesRepository = new DevicesRepository();
const jwtService = new JwtService();
export const usersRepository = new UserRepository();
const nodemailerService = new NodemailerService();
const bcryptService = new BcryptService();
const usersQwRepository = new UserQueryRepo();
const authService = new AuthService(
  securityDevicesRepository,
  jwtService,
  usersRepository,
  nodemailerService,
  bcryptService,
  usersQwRepository,
);
export const authControllerInstance = new AuthController(authService);

const blogRepository = new BlogRepository();
const blogService = new BlogService(blogRepository);
export const blogControllerInstance = new BlogController(blogService);

const commentRepository = new CommentRepository();
const postQueryRepository = new PostQueryRepository();
const commentService = new CommentService(
  commentRepository,
  postQueryRepository,
);
export const commentControllerInstance = new CommentController(commentService);

export const postRepository = new PostRepository(usersRepository);
// const postQueryRepository = new PostQueryRepository();
const postService = new PostService(postRepository, postQueryRepository);
export const postControllerInstance = new PostController(postService);

const securityDevicesQueryRepository = new SecurityDevicesQueryRepository();
// const securityDevicesRepository = new DevicesRepository();
const securityDevicesService = new SecurityDevicesService(
  securityDevicesRepository,
  securityDevicesQueryRepository,
);
export const securityDevicesControllerInstance = new SecurityDevicesController(
  securityDevicesService,
);

// const usersQwRepository = new UserQueryRepo();
// const usersRepository = new UserRepository();
const userService = new UserService(
  usersRepository,
  usersQwRepository,
  bcryptService,
);
export const userControllerInstance = new UserController(userService);
