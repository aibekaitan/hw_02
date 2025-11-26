import { Post } from '../types/post';
import { postsCollection } from '../../db/collections';
import { DeleteResult, UpdateResult, WithId } from 'mongodb';
import { PostInputModel } from '../dto/post.input';
import { PostPaginator } from '../types/paginator';
import { mapToPostsOutput } from '../mappers/map-post-to-output';

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

    const totalCount = await postsCollection.countDocuments();

    const items = await postsCollection
      .find({})
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();
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
  async findById(id: string): Promise<WithId<Post> | null> {
    return postsCollection.findOne({ id });
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
    await postsCollection.insertOne(post);
    return post;
  },
  async update(id: string, dto: PostInputModel): Promise<UpdateResult<Post>> {
    return postsCollection.updateOne(
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
    return postsCollection.deleteOne({ id });
  },
};
