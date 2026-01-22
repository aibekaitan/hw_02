import { ObjectId, UpdateResult, WithId } from 'mongodb';
// import { db } from '../../db';
// import { commentsCollection, postsCollection } from '../../db/collections';
import {
  CommentDB,
  CommentInputModel,
  CommentViewModel,
  LikesInfoViewModel,
} from '../types/comments.dto';
import { CommentModel } from '../../models/comment.model';
import { LikeModel, LikeStatus } from '../../models/like.model';

export const commentsRepository = {
  async delete(id: string): Promise<boolean> {
    const isDel = await CommentModel.deleteOne({ id });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<CommentDB | null> {
    return await CommentModel.findOne({ id }).select('-__v').lean().exec();
  },
  async findById2(
    id: string,
    currentUserId?: string,
  ): Promise<CommentViewModel | null> {
    const comment = await CommentModel.findOne({ id })
      .select('-__v')
      .lean()
      .exec();

    if (!comment) return null;
    const [likesCount, dislikesCount, myLike] = await Promise.all([
      LikeModel.countDocuments({
        parentId: id,
        parentType: 'Comment',
        status: LikeStatus.Like,
      }),
      LikeModel.countDocuments({
        parentId: id,
        parentType: 'Comment',
        status: LikeStatus.Dislike,
      }),
      currentUserId
        ? LikeModel.findOne({
            parentId: id,
            parentType: 'Comment',
            authorId: currentUserId,
          }).lean()
        : null,
    ]);

    const likesInfo: LikesInfoViewModel = {
      likesCount,
      dislikesCount,
      myStatus: myLike?.status || LikeStatus.None,
    };

    return {
      ...comment,
      likesInfo,
    };
  },
  async update(
    id: string,
    dto: CommentInputModel,
  ): Promise<UpdateResult<CommentInputModel> | null> {
    return CommentModel.updateOne(
      { id: id },
      {
        $set: {
          content: dto.content,
        },
      },
    );
  },
};
