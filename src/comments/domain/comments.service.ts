// import { usersRepository } from '../infrastructure/user.repository';
// import { bcryptService } from '../../auth/adapters/bcrypt.service';
// import { IUserDB } from '../types/user.db.interface';
// import { CreateUserDto } from '../types/create-user.dto';
import { commentsRepository } from '../infrastructure/comments.repository';
import { CommentInputModel } from '../types/comments.dto';
import { UpdateResult, WithId } from 'mongodb';

export const commentsService = {
  async delete(id: string): Promise<boolean> {
    const comment = await commentsRepository.findById(id);
    if (!comment) return false;

    return await commentsRepository.delete(id);
  },
  async update(id: string, dto: CommentInputModel) {
    return await commentsRepository.update(id, dto);
  },
  async findById(id: string) {
    const comment = await commentsRepository.findById(id);
    if (!comment) return false;

    return comment;
  },
};
