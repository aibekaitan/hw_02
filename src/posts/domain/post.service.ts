import { PostRepository } from '../repositories/posts-repository';
import { PostInputModel } from '../dto/post.input';
import { CommentInputModel } from '../../comments/types/comments.dto';
import { PostQueryRepository } from '../repositories/post.query.repository';
import { SortQueryFilterType } from '../../common/types/sortQueryFilter.type';
import { sortQueryFieldsUtil } from '../../common/utils/sortQueryFields.util';
import { CommentsQueryFieldsType } from '../types/comments.queryFields.type';
import { LikeStatus } from '../../models/like.model';

export class PostService {
  constructor(
    protected postRepository: PostRepository,
    protected postQwRepository: PostQueryRepository,
  ) {}
  async getAllPosts(query: any, currentUserId: string | undefined) {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const sortBy = (query.sortBy as string) || 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';

    return this.postRepository.findAll(
      {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      currentUserId,
    );
  }
  async getPostById(postId: string, currentUserId?: string) {
    return this.postRepository.findById(postId, currentUserId);
  }
  async createPost(dto: PostInputModel, blogName: string) {
    return this.postRepository.create(dto, blogName);
  }
  async createComment(
    postId: string,
    dto: CommentInputModel,
    currentUserId: string,
  ) {
    const createdComment = await this.postRepository.createComment(
      dto,
      postId,
      currentUserId,
    );

    return this.postQwRepository._getInViewComment(
      createdComment,
      currentUserId,
    );
  }
  async getCommentsByPostId(
    postId: string,
    query: CommentsQueryFieldsType,
    currentUserId?: string,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      sortQueryFieldsUtil(query);

    return this.postQwRepository.findAllCommentsByPostId(
      postId,
      {
        searchLoginTerm: query.searchLoginTerm,
        searchEmailTerm: query.searchEmailTerm,
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
      },
      currentUserId,
    );
  }
  async updatePost(postId: string, dto: PostInputModel): Promise<boolean> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      return false;
    }

    await this.postRepository.update(postId, dto);
    return true;
  }
  async deletePost(postId: string): Promise<boolean> {
    await this.postRepository.delete(postId);
    return true;
  }
  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    await this.postRepository.setLikeStatus(postId, userId, likeStatus);

    return true;
  }
}
