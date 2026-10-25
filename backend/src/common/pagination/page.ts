import type { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ILike, type FindOperator } from 'typeorm';
import { type ListQueryDto, SortOrder } from '@/common/pagination/list-query.dto.js';

const LIKE_SPECIAL_CHARACTERS = /[\\%_]/g;

export interface IPage<T> {
  items: T[];
  total: number;
}

export const PageDto = <T>(item: Type<T>) => {
  class Page implements IPage<T> {
    @ApiProperty({ type: [item] })
    items: T[];

    @ApiProperty({ example: 42 })
    total: number;
  }

  Object.defineProperty(Page, 'name', { value: `${item.name.replace(/Dto$/, '')}PageDto` });

  return Page;
};

export const toPageWindow = ({ page, pageSize }: ListQueryDto) => ({ skip: (page - 1) * pageSize, take: pageSize });

export const toSqlDirection = (order: SortOrder) => (order === SortOrder.Desc ? 'DESC' : 'ASC');

export const containsIgnoringCase = (search: string): FindOperator<string> => ILike(`%${search.replace(LIKE_SPECIAL_CHARACTERS, '\\$&')}%`);
