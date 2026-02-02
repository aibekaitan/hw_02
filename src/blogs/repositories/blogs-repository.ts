import { Blog } from '../types/blog';
// import { blogsCollection, postsCollection } from '../../db/collections';
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from 'mongodb';
import { BlogInputModel } from '../dto/blog.input';
import { BlogPaginator } from '../types/paginator';
import { mapToBlogsOutput } from '../mappers/map-blog-to-output';
import { PostPaginator } from '../../posts/types/paginator';
import { mapToPostsOutput } from '../../posts/mappers/map-post-to-output';
import { BlogModel } from '../../models/blog.model';
import { PostModel } from '../../models/post.model';
import { LikeModel, LikeStatus } from '../../models/like.model';
import { BlogService } from '../domain/blogs-service';
import { BlogPostInputModel } from '../dto/blogPost.input';
import { Post } from '../../posts/types/post';

export class BlogRepository {
  constructor() {}
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

    const totalCount = await BlogModel.countDocuments(filter);

    const items = await BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-__v')
      .lean()
      .exec();

    const mappedBlogs = mapToBlogsOutput(items);
    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: mappedBlogs,
    };
  }
  async findById(id: string): Promise<WithId<Blog> | null> {
    return BlogModel.findOne({ id });
  }
  async findPostsByBlogId(
    blogId: string,
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

    const filter = { blogId };

    const totalCount = await PostModel.countDocuments(filter);

    const dbItems = await PostModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-__v')
      .lean()
      .exec();

    const userLikesMap = new Map<string, LikeStatus>();
    if (currentUserId) {
      const userLikes = await LikeModel.find({
        parentType: 'Post',
        authorId: currentUserId,
      })
        .lean()
        .select('parentId status');

      userLikes.forEach((like) => userLikesMap.set(like.parentId, like.status));
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
  async create(blog: Blog): Promise<Blog> {
    // return blogsCollection.insertOne(blog);
    const created = await BlogModel.create(blog);
    return created.toObject({ versionKey: false });
  }
  async createPostByBlogId(
    blogId: string,
    dto: BlogPostInputModel,
  ): Promise<Post | null> {
    const blog = await BlogModel.findOne({ id: blogId });
    if (!blog) {
      return null;
    }

    const createdAt = new Date().toISOString();

    const post: Post = {
      id: new Date().toISOString(),
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId,
      blogName: blog.name,
      createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };

    await PostModel.insertOne(post);
    return post;
  }
  async update(id: string, dto: BlogInputModel): Promise<UpdateResult<Blog>> {
    return BlogModel.updateOne(
      { id },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );
  }
  async delete(id: string): Promise<DeleteResult> {
    return BlogModel.deleteOne({ id });
  }
}
export const blogRepository = new BlogRepository();
