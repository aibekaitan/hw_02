import { ObjectId, UpdateResult, WithId } from 'mongodb';
// import { db } from '../../db';
import { commentsCollection, postsCollection } from '../../db/collections';
import {
  CommentDB,
  CommentInputModel,
  CommentViewModel,
} from '../types/comments.dto';
export const commentsRepository = {
  async delete(id: string): Promise<boolean> {
    const isDel = await commentsCollection.deleteOne({ id });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<WithId<CommentDB> | null> {
    return commentsCollection.findOne({ id });
  },
  async update(
    id: string,
    dto: CommentInputModel,
  ): Promise<UpdateResult<CommentInputModel> | null> {
    return commentsCollection.updateOne(
      { id: id },
      {
        $set: {
          content: dto.content,
        },
      },
    );
  },
};
