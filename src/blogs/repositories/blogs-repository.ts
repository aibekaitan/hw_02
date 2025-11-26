import { Blog } from '../types/blog';
import { blogsCollection, postsCollection } from '../../db/collections';
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from 'mongodb';
import { BlogInputModel } from '../dto/blog.input';
import { BlogPaginator } from '../types/paginator';
import { mapToBlogsOutput } from '../mappers/map-blog-to-output';
import { PostPaginator } from '../../posts/types/paginator';
import { mapToPostsOutput } from '../../posts/mappers/map-post-to-output';

export const blogsRepository = {
  async findAllBlogs(params: {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
    searchNameTerm: string | null;
  }): Promise<BlogPaginator> {
    const pageNumber = params.pageNumber;
    const pageSize = params.pageSize;
    const sortBy = params.sortBy;
    const sortDirection = params.sortDirection === 'asc' ? 1 : -1;

    const filter = params?.searchNameTerm
      ? { name: { $regex: params.searchNameTerm, $options: 'i' } } // регистронезависимый поиск
      : {};

    const totalCount = await blogsCollection.countDocuments(filter);

    const items = await blogsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    const mappedBlogs = mapToBlogsOutput(items);
    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: mappedBlogs,
    };
  },
  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsCollection.findOne({ id: id });
  },
  async findPostsByBlogId(
    id: string,
    params: {
      pageNumber: number;
      pageSize: number;
      sortBy: string;
      sortDirection: string;
    },
  ): Promise<PostPaginator> {
    const pageNumber = params.pageNumber;
    const pageSize = params.pageSize;
    const sortBy = params.sortBy;
    const sortDirection = params.sortDirection === 'asc' ? 1 : -1;

    const filter = { blogId: id };

    const totalCount = await postsCollection.countDocuments({ blogId: id });

    const items = await postsCollection
      .find(filter)
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
  },
  async create(blog: Blog): Promise<InsertOneResult<Blog>> {
    return blogsCollection.insertOne(blog);
  },
  async update(id: string, dto: BlogInputModel): Promise<UpdateResult<Blog>> {
    return blogsCollection.updateOne(
      { id },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );
  },
  async delete(id: string): Promise<DeleteResult> {
    return blogsCollection.deleteOne({ id: id });
  },
};
