import { ObjectId } from 'mongodb';
import { IPagination } from '../../common/types/pagination';
import { SortQueryFilterType } from '../../common/types/sortQueryFilter.type';
import { CommentDB, CommentViewModel } from '../../comments/types/comments.dto';
import { CommentModel } from '../../models/comment.model';
import { LikeModel, LikeStatus } from '../../models/like.model';
import { PostService } from '../domain/post.service';

export class PostQueryRepository {
  constructor() {}
  async findAllCommentsByPostId(
    postId: string,
    sortQueryDto: SortQueryFilterType,
    currentUserId?: string,
  ): Promise<IPagination<CommentViewModel[]>> {
    const { sortBy, sortDirection, pageSize, pageNumber } = sortQueryDto;

    const filter = { postId };

    const totalCount = await CommentModel.countDocuments(filter);

    const comments = await CommentModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-_id -__v')
      .lean();

    const items = await Promise.all(
      comments.map((comment) => this._getInViewComment(comment, currentUserId)),
    );

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }

  async _getInViewComment(
    comment: CommentDB,
    currentUserId?: string,
  ): Promise<CommentViewModel> {
    const [likesCount, dislikesCount, myLike] = await Promise.all([
      LikeModel.countDocuments({
        parentId: comment.id,
        parentType: 'Comment',
        status: LikeStatus.Like,
      }),
      LikeModel.countDocuments({
        parentId: comment.id,
        parentType: 'Comment',
        status: LikeStatus.Dislike,
      }),
      currentUserId
        ? LikeModel.findOne({
            parentId: comment.id,
            parentType: 'Comment',
            authorId: currentUserId,
          })
            .select('status')
            .lean()
        : null,
    ]);

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin ?? 'Deleted user',
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus: myLike?.status ?? LikeStatus.None,
      },
    };
  }

  _checkObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  }
}
