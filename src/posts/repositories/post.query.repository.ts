import { ObjectId, WithId } from 'mongodb';
import { IPagination } from '../../common/types/pagination';
import { SortQueryFilterType } from '../../common/types/sortQueryFilter.type';
// import { db } from "../../db";
// import {
//   commentsCollection,
//   postsCollection,
//   usersCollection,
// } from '../../db/collections';
import { CommentDB, CommentViewModel } from '../../comments/types/comments.dto';
import { CommentModel } from '../../models/comment.model';

export const postsQwRepository = {
  async findAllCommentsByPostId(
    postId: string,
    sortQueryDto: SortQueryFilterType,
  ): Promise<IPagination<CommentViewModel[]>> {
    const { sortBy, sortDirection, pageSize, pageNumber } = sortQueryDto;
    const filter: any = { postId };
    const totalCount = await CommentModel.countDocuments(filter);

    const comments = await CommentModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-_id -__v');

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: comments.map((u) => this._getInViewComment(u)),
    };
  },
  // async findById(id: string): Promise<CommentViewModel | null> {
  //   const post = await postsCollection.findOne({ _id: new ObjectId(id) });
  //   return post ? this._getInViewPost(post) : null;
  // },
  // _getInViewPost(comment: WithId<Post>): CommentViewModel {
  //   return {
  //     id: comment._id.toString(),
  //     content: comment.content,
  //     commentatorInfo: comment.commentatorInfo,
  //     createdAt: comment.createdAt.toISOString(),
  //   };
  // },
  // _checkObjectId(id: string): boolean {
  //   return ObjectId.isValid(id);
  // },
  _getInViewComment(comment: CommentDB): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
    };
  },
  _checkObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  },
};
