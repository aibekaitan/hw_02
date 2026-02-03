// import { usersRepository } from '../infrastructure/user.repository';
// import { bcryptService } from '../../auth/adapters/bcrypt.service';
// import { IUserDB } from '../types/user.db.interface';
// import { CreateUserDto } from '../types/create-user.dto';
import { CommentInputModel } from '../types/comments.dto';
import { UpdateResult, WithId } from 'mongodb';
import { LikeModel, LikeStatus } from '../../models/like.model';
import { PostQueryRepository } from '../../posts/repositories/post.query.repository';
import { CommentRepository } from '../infrastructure/comments.repository';
import { injectable } from 'inversify';
import { inject } from 'inversify';
@injectable()
export class CommentService {
  constructor(
    protected commentRepository: CommentRepository,
    protected postQueryRepository: PostQueryRepository,
  ) {}
  async getCommentById(commentId: string, currentUserId?: string) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) return null;

    return this.postQueryRepository._getInViewComment(comment, currentUserId);
  }
  async delete(id: string): Promise<boolean> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) return false;

    return await this.commentRepository.delete(id);
  }
  async update(id: string, dto: CommentInputModel) {
    return await this.commentRepository.update(id, dto);
  }
  async findById(id: string) {
    const comment = await this.commentRepository.findById(id);
    if (!comment) return false;

    return comment;
  }
  async setLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ) {
    await this.commentRepository.setLikeStatus(commentId, userId, likeStatus);
  }
}
