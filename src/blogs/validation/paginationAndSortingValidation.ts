import { query } from 'express-validator';
import { SortDirection } from '../../core/types/sort';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_DIRECTION = SortDirection.Desc;

export function paginationAndSortingValidation<T extends string>() {
  //Record<string, T> - тип объекта, где ключи типа string, значения типа Т
  return [
    query('pageNumber')
      .default(DEFAULT_PAGE)
      .isInt({ min: 1 })
      .withMessage('Page number must be a positive integer')
      .toInt(),

    query('pageSize')
      .default(DEFAULT_PAGE_SIZE)
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100')
      .toInt(),

    query('sortBy')
      .default('createdAt') // Дефолтное значение - первое поле
      .isIn(['createdAt'])
      .withMessage('Sort field must be createdAt'),

    query('sortDirection')
      .default(DEFAULT_SORT_DIRECTION)
      .isIn(Object.values(SortDirection))
      .withMessage(
        `Sort direction must be one of: ${Object.values(SortDirection).join(', ')}`,
      ),
  ];
}
