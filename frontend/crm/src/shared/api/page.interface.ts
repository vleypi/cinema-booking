import type { SortOrder } from "@/shared/config";

export interface IPage<T> {
  items: T[];
  total: number;
}

export interface IListRequest<TSort extends string> {
  search?: string;
  sort?: TSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}
