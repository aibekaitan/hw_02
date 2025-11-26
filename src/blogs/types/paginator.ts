import { Blog } from './blog';

export type BlogPaginator = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Blog[];
};
