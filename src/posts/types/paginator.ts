import { Post } from './post';

export type PostPaginator = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Post[]; //generic
};
