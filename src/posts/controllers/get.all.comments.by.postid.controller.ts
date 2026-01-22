import { NextFunction, Request, Response } from 'express';
import { postsQwRepository } from '../repositories/post.query.repository';
import { sortQueryFieldsUtil } from '../../common/utils/sortQueryFields.util';
import {
  ParamsType,
  RequestWithParamsAndQuery,
} from '../../common/types/requests';
import { CommentsQueryFieldsType } from '../types/comments.queryFields.type';
import { IPagination } from '../../common/types/pagination';
import { CommentViewModel } from '../../comments/types/comments.dto';

export const getCommentsByPostIdController = async (
  req: RequestWithParamsAndQuery<ParamsType, CommentsQueryFieldsType>,
  res: Response<IPagination<CommentViewModel[]>>,
) => {
  const { pageNumber, pageSize, sortBy, sortDirection } = sortQueryFieldsUtil(
    req.query,
  );
  const currentUserId = req.user?.id ?? undefined;
  const allComments = await postsQwRepository.findAllCommentsByPostId(
    req.params.id,
    {
      searchLoginTerm: req.query.searchLoginTerm,
      searchEmailTerm: req.query.searchEmailTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    },
    currentUserId,
  );

  res.status(200).send(allComments);
};
