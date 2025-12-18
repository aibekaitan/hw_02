import { ObjectId, UpdateResult, WithId } from 'mongodb';
// import { db } from '../../db';
import { commentsCollection, postsCollection } from '../../db/collections';
import { CommentInputModel, CommentViewModel } from '../types/comments.dto';
export const commentsRepository = {
  async delete(id: string): Promise<boolean> {
    const isDel = await commentsCollection.deleteOne({ _id: new ObjectId(id) });
    return isDel.deletedCount === 1;
  },
  async findById(id: string): Promise<WithId<CommentViewModel> | null> {
    return commentsCollection.findOne({ _id: new ObjectId(id) });
  },
  async findById2(id: string): Promise<WithId<CommentViewModel> | null> {
    return commentsCollection.findOne({ id: new ObjectId(id) });
  },
  async update(
    id: string,
    dto: CommentInputModel,
  ): Promise<UpdateResult<CommentInputModel> | null> {
    return commentsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          content: dto.content,
        },
      },
    );
  },
};
