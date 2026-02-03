import { Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { CommentService } from '../domain/comments.service';

export class CommentController {
  constructor(protected commentService: CommentService) {}
  async getCommentById(req: Request, res: Response) {
    const currentUserId = req.user?.id;

    const comment = await this.commentService.getCommentById(
      req.params.id,
      currentUserId,
    );

    if (!comment) {
      return res.sendStatus(404);
    }

    res.status(200).send(comment);
  }
  async delete(req: Request, res: Response) {
    await this.commentService.delete(req.params.id);
    res.sendStatus(204);
  }
  async updateComment(req: Request, res: Response) {
    await this.commentService.update(req.params.id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  }
  async setLikeStatus(req: Request, res: Response) {
    const userId = req.user!.id;
    await this.commentService.setLikeStatus(
      req.params.id,
      userId,
      req.body.likeStatus,
    );
    res.sendStatus(HttpStatus.NoContent);
  }
}
