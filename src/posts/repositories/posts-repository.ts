import { Post, PostDB } from '../types/post';
import { DeleteResult, UpdateResult } from 'mongodb';
import { PostInputModel } from '../dto/post.input';
import { PostPaginator } from '../types/paginator';
import {
  CommentDB,
  CommentInputModel,
} from '../../comments/types/comments.dto';
import { PostModel } from '../../models/post.model';
import { CommentModel } from '../../models/comment.model';
import { LikeModel, LikeStatus } from '../../models/like.model';
import { UserRepository } from '../../users/infrastructure/user.repository';
import { injectable } from 'inversify';
@injectable()
export class PostRepository {
  constructor(protected usersRepository: UserRepository) {}
  async findAll(
    params: {
      pageNumber: number;
      pageSize: number;
      sortBy: string;
      sortDirection: string;
    },
    currentUserId?: string,
  ): Promise<PostPaginator> {
    const pageNumber = params.pageNumber;
    const pageSize = params.pageSize;
    const sortBy = params.sortBy;
    const sortDirection = params.sortDirection === 'asc' ? 1 : -1;

    const totalCount = await PostModel.countDocuments();

    const dbItems = await PostModel.find({})
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-__v')
      .lean();

    const userLikesMap = new Map<string, LikeStatus>();
    if (currentUserId) {
      const userLikes = await LikeModel.find({
        parentType: 'Post',
        authorId: currentUserId,
      })
        .lean()
        .select('parentId status');

      userLikes.forEach((like) => {
        userLikesMap.set(like.parentId, like.status);
      });
    }

    const mappedItems = dbItems.map((post) => {
      const extendedLikesInfo = post.extendedLikesInfo || {
        likesCount: 0,
        dislikesCount: 0,
        newestLikes: [],
      };

      const myStatus = userLikesMap.get(post.id) ?? LikeStatus.None;

      const newestLikes = extendedLikesInfo.newestLikes || [];
      const reversedLikes = [...newestLikes].reverse();

      return {
        ...post,
        extendedLikesInfo: {
          likesCount: extendedLikesInfo.likesCount,
          dislikesCount: extendedLikesInfo.dislikesCount,
          myStatus,
          newestLikes: reversedLikes,
        },
      };
    });
    const finalItems = mappedItems.map((post) => {
      const { _id, __v, ...cleanPost } = post;
      return cleanPost;
    });

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: finalItems,
    };
  }
  async findById(id: string, currentUserId?: string): Promise<Post | null> {
    const dbPost: PostDB | null = await PostModel.findOne({ id })
      .select('-__v')
      .lean()
      .exec();

    if (!dbPost) {
      return null;
    }

    let myStatus = LikeStatus.None;

    if (currentUserId) {
      const like = await LikeModel.findOne({
        parentId: id,
        parentType: 'Post',
        authorId: currentUserId,
      }).lean();

      myStatus = like?.status ?? LikeStatus.None;
    }

    const newestLikes = dbPost.extendedLikesInfo?.newestLikes || [];
    const reversedLikes = [...newestLikes].reverse();

    const apiPost: Post = {
      id: dbPost.id,
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      createdAt: dbPost.createdAt,
      extendedLikesInfo: {
        likesCount: dbPost.extendedLikesInfo.likesCount,
        dislikesCount: dbPost.extendedLikesInfo.dislikesCount,
        myStatus,
        newestLikes: reversedLikes,
      },
    };

    return apiPost;
  }
  async create(dto: PostInputModel, blogName: string): Promise<Post> {
    const createdAt = new Date();
    const post: Post = {
      id: new Date().toISOString(),
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName,
      createdAt: createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
    await PostModel.create(post);
    return post;
  }
  async createComment(
    dto: CommentInputModel,
    postId: string,
    userId: string,
  ): Promise<CommentDB> {
    const createdAt = new Date();
    const user = await this.usersRepository.findById(userId);

    const comment: CommentDB = {
      id: new Date().toISOString(),
      content: dto.content,
      postId: postId,
      commentatorInfo: {
        userId: userId,
        userLogin: user?.login,
      },
      createdAt: createdAt.toISOString(),
    };
    await CommentModel.create(comment);
    return comment;
  }
  async update(id: string, dto: PostInputModel): Promise<UpdateResult<Post>> {
    return PostModel.updateOne(
      { id },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
        },
      },
    );
  }
  async delete(id: string): Promise<DeleteResult> {
    return PostModel.deleteOne({ id });
  }
  async setLikeStatus(postId: string, userId: string, likeStatus: LikeStatus) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const likeDoc = await LikeModel.findOne({
      parentId: postId,
      parentType: 'Post',
      authorId: userId,
    }).lean();

    const prevStatus = likeDoc?.status ?? LikeStatus.None;

    if (prevStatus === likeStatus) {
      return;
    }

    const postUpdate: any = {};

    if (prevStatus === LikeStatus.Like) {
      postUpdate.$inc = {
        ...(postUpdate.$inc || {}),
        'extendedLikesInfo.likesCount': -1,
      };
      postUpdate.$pull = {
        'extendedLikesInfo.newestLikes': { userId: userId },
      };
    } else if (prevStatus === LikeStatus.Dislike) {
      postUpdate.$inc = {
        ...(postUpdate.$inc || {}),
        'extendedLikesInfo.dislikesCount': -1,
      };
    }

    if (likeStatus === LikeStatus.Like) {
      postUpdate.$inc = {
        ...(postUpdate.$inc || {}),
        'extendedLikesInfo.likesCount': 1,
      };
      postUpdate.$push = {
        'extendedLikesInfo.newestLikes': {
          $each: [
            {
              addedAt: new Date().toISOString(),
              userId: userId,
              login: user.login,
            },
          ],
          $slice: -3,
        },
      };
    } else if (likeStatus === LikeStatus.Dislike) {
      postUpdate.$inc = {
        ...(postUpdate.$inc || {}),
        'extendedLikesInfo.dislikesCount': 1,
      };
    }

    if (Object.keys(postUpdate).length > 0) {
      await PostModel.updateOne({ id: postId }, postUpdate);
    }

    if (likeStatus === LikeStatus.None) {
      if (likeDoc) {
        await LikeModel.deleteOne({
          parentId: postId,
          parentType: 'Post',
          authorId: userId,
        });
      }
    } else {
      await LikeModel.updateOne(
        {
          parentId: postId,
          parentType: 'Post',
          authorId: userId,
        },
        {
          $set: {
            status: likeStatus,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
  }
}
