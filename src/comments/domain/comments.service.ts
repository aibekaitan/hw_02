// import { usersRepository } from '../infrastructure/user.repository';
// import { bcryptService } from '../../auth/adapters/bcrypt.service';
// import { IUserDB } from '../types/user.db.interface';
// import { CreateUserDto } from '../types/create-user.dto';
import { commentsRepository } from '../infrastructure/comments.repository';
import { CommentInputModel } from '../types/comments.dto';
import { UpdateResult, WithId } from 'mongodb';
import { LikeModel, LikeStatus } from '../../models/like.model';

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
  async setLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ) {
    if (likeStatus === LikeStatus.None) {
      await LikeModel.deleteOne({
        parentId: commentId,
        parentType: 'Comment',
        authorId: userId,
      });
    } else {
      await LikeModel.updateOne(
        { parentId: commentId, parentType: 'Comment', authorId: userId },
        {
          $set: {
            status: likeStatus,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
  },
};
