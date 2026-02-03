import { PostService } from '../domain/post.service';
import { Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import {
  ParamsType,
  RequestWithParamsAndQuery,
} from '../../common/types/requests';
import { CommentsQueryFieldsType } from '../types/comments.queryFields.type';
import { IPagination } from '../../common/types/pagination';
import { CommentViewModel } from '../../comments/types/comments.dto';

export class PostController {
  constructor(protected postService: PostService) {}
  async getAllPosts(req: Request, res: Response) {
    const currentUserId = req.user?.id;

    const result = await this.postService.getAllPosts(req.query, currentUserId);

    res.status(HttpStatus.Ok).send(result);
  }
  async getPost(req: Request, res: Response) {
    const postId = req.params.id;
    const currentUserId = req.user?.id;

    const post = await this.postService.getPostById(postId, currentUserId);

    if (!post) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
    }

    res.status(HttpStatus.Ok).send(post);
  }
  async createPostController(req: Request, res: Response) {
    const blog = (req as any).blog;

    const post = await this.postService.createPost(req.body, blog.name);

    res.status(HttpStatus.Created).send(post);
  }
  async createComment(req: Request, res: Response) {
    if (!req.user) {
      return res.sendStatus(HttpStatus.Unauthorized);
    }

    const commentView = await this.postService.createComment(
      req.params.id,
      req.body,
      req.user.id,
    );

    res.status(HttpStatus.Created).send(commentView);
  }
  async getCommentsByPostId(
    req: RequestWithParamsAndQuery<ParamsType, CommentsQueryFieldsType>,
    res: Response<IPagination<CommentViewModel[]>>,
  ) {
    const currentUserId = req.user?.id;

    const comments = await this.postService.getCommentsByPostId(
      req.params.id,
      req.query,
      currentUserId,
    );

    res.status(200).send(comments);
  }
  async updatePost(req: Request, res: Response) {
    const updated = await this.postService.updatePost(req.params.id, req.body);

    if (!updated) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
    }

    res.sendStatus(HttpStatus.NoContent);
  }
  async updateLikeStatusOfPost(req: Request, res: Response) {
    const userId = req.user!.id;

    const updated = await this.postService.updateLikeStatus(
      req.params.id,
      userId,
      req.body.likeStatus,
    );

    if (!updated) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
    }

    res.sendStatus(HttpStatus.NoContent);
  }
  async deletePost(req: Request, res: Response) {
    const deleted = await this.postService.deletePost(req.params.id);

    if (!deleted) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'post not found' }]),
        );
    }

    res.sendStatus(HttpStatus.NoContent);
  }
}
