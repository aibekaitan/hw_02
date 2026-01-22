import { Post } from '../types/post';
// import { commentsCollection, postsCollection } from '../../db/collections';
import { DeleteResult, ObjectId, UpdateResult, WithId } from 'mongodb';
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
      .select('-_id -__v');
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
    return PostModel.findOne({ id }).select('-_id -__v');
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
};
