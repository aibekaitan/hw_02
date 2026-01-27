import { Post } from '../types/post';
// import { commentsCollection, postsCollection } from '../../db/collections';
import { DeleteResult, UpdateResult } from 'mongodb';
import { PostInputModel } from '../dto/post.input';
import { PostPaginator } from '../types/paginator';
import { mapToPostsOutput } from '../mappers/map-post-to-output';
import {
  CommentDB,
  CommentInputModel,
} from '../../comments/types/comments.dto';
import { usersRepository } from '../../users/infrastructure/user.repository';
import { PostModel } from '../../models/post.model';
import { CommentModel } from '../../models/comment.model';
import { LikeModel, LikeStatus } from '../../models/like.model';

export const postsRepository = {
  async findAll(params: {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }): Promise<PostPaginator> {
    const pageNumber = params.pageNumber;
    const pageSize = params.pageSize;
    const sortBy = params.sortBy;
    const sortDirection = params.sortDirection === 'asc' ? 1 : -1;

    // const filter = params?.searchNameTerm
    //   ? { name: { $regex: params.searchNameTerm, $options: 'i' } } // регистронезависимый поиск
    //   : {};

    const totalCount = await PostModel.countDocuments();

    const items = await PostModel.find({})
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-__v')
      .lean();
    const mappedBlogs = mapToPostsOutput(items);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: mappedBlogs,
    };
    // return postsCollection.find({}).toArray();
  },
  async findById(id: string): Promise<Post | null> {
    return await PostModel.findOne({ id }).select('-__v').lean().exec();
  },
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
  },
  async createComment(
    dto: CommentInputModel,
    postId: string,
    userId: string,
  ): Promise<CommentDB> {
    const createdAt = new Date();
    const user = await usersRepository.findById(userId);

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
  },
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
  },
  async delete(id: string): Promise<DeleteResult> {
    return PostModel.deleteOne({ id });
  },
  async setLikeStatus(postId: string, userId: string, likeStatus: LikeStatus) {
    const user = await usersRepository.findById(userId);
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
  },
};
