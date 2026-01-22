import { NextFunction, Request, Response } from 'express';
import { postsRepository } from '../repositories/posts-repository';
import { HttpStatus } from '../../core/types/http-statuses';

export const getAllPostsController = async (req: Request, res: Response) => {
  console.log('Query params:', req.query);
  console.log('Body:', req.body);
  const pageNumber = Number(req.query.pageNumber) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortDirection =
    (req.query.sortDirection as string) === 'asc' ? 'asc' : 'desc';
  // const searchNameTerm = (req.query.searchNameTerm as string) || null;

  const result = await postsRepository.findAll({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  });
  res.status(HttpStatus.Ok).send(result);
};
