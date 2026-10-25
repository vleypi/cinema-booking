"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE, LIST_PARAMS, LIST_TEXT, SORT_ORDERS, type SortOrder } from "@/shared/config";

type ParamChanges = Partial<Record<(typeof LIST_PARAMS)[keyof typeof LIST_PARAMS], string | undefined>>;

const parsePage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > FIRST_PAGE ? page : FIRST_PAGE;
};

export const useListParams = <TSort extends string>(sortFields: readonly TSort[], pageSize: number = DEFAULT_PAGE_SIZE) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortParam = searchParams.get(LIST_PARAMS.sort);
  const sort = sortFields.find((field) => field === sortParam);
  const order: SortOrder = searchParams.get(LIST_PARAMS.order) === SORT_ORDERS.desc ? SORT_ORDERS.desc : SORT_ORDERS.asc;
  const search = searchParams.get(LIST_PARAMS.search) ?? "";
  const page = parsePage(searchParams.get(LIST_PARAMS.page));

  const update = (changes: ParamChanges) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  const setSort = (field: TSort | undefined, nextOrder: SortOrder = SORT_ORDERS.asc) =>
    update({ sort: field, order: field && nextOrder === SORT_ORDERS.desc ? nextOrder : undefined, page: undefined });

  const toggleSort = (field: TSort) => setSort(field, sort === field && order === SORT_ORDERS.asc ? SORT_ORDERS.desc : SORT_ORDERS.asc);

  return {
    search,
    sort,
    order,
    page,
    pageSize,
    request: { search: search || undefined, sort, order: sort ? order : undefined, page, pageSize },
    sorting: { field: sort, order, onToggle: toggleSort },
    getEmptyText: (emptyListText: string) => (search ? LIST_TEXT.notFound : emptyListText),
    setSearch: (value: string) => update({ search: value.trim() || undefined, page: undefined }),
    setPage: (value: number) => update({ page: value > FIRST_PAGE ? String(value) : undefined }),
    setSort,
  };
};
