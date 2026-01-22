import { ObjectId, UpdateResult, WithId } from 'mongodb';
// import { db } from '../../db';
// import { commentsCollection, postsCollection } from '../../db/collections';
import {
  CommentDB,
  CommentInputModel,
  CommentViewModel,
} from '../types/comments.dto';
import { CommentModel } from '../../models/comment.model';

export const commentsRepository = {
  async delete(id: string): Promise<boolean> {
    const isDel = await CommentModel.deleteOne({ id });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<CommentDB | null> {
    return CommentModel.findOne({ id }).select('-_id -__v');
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
