import { joinClassNames } from "@luch/shared/lib";
import { Icon } from "@luch/shared/ui";
import type { KeyboardEvent, ReactNode } from "react";
import { SORT_ORDERS, type SortOrder } from "@/shared/config";
import { CARD_CLASS_NAME } from "@/shared/ui/ui.constant";

export interface IDataTableColumn<TRow, TSort extends string = string> {
  key: string;
  header: string;
  className?: string;
  sortField?: TSort;
  render: (row: TRow) => ReactNode;
}

export interface IDataTableSorting<TSort extends string> {
  field: TSort | undefined;
  order: SortOrder;
  onToggle: (field: TSort) => void;
}

interface IDataTableProps<TRow, TSort extends string> {
  columns: readonly IDataTableColumn<TRow, TSort>[];
  sorting?: IDataTableSorting<TSort>;
  rows: readonly TRow[] | undefined;
  getRowKey: (row: TRow) => string;
  isLoading: boolean;
  emptyText: string;
  onRowClick?: (row: TRow) => void;
  isRowClickable?: (row: TRow) => boolean;
}

const SKELETON_ROW_KEYS = ["first", "second", "third", "fourth"] as const;

const ARIA_SORT: Record<SortOrder, "ascending" | "descending"> = {
  [SORT_ORDERS.asc]: "ascending",
  [SORT_ORDERS.desc]: "descending",
};

export const DataTable = <TRow, TSort extends string = string>({
  columns,
  sorting,
  rows,
  getRowKey,
  isLoading,
  emptyText,
  onRowClick,
  isRowClickable = () => true,
}: IDataTableProps<TRow, TSort>) => {
  const activate = (row: TRow) => {
    if (onRowClick && isRowClickable(row)) onRowClick(row);
  };

  const handleKeyDown = (event: KeyboardEvent, row: TRow) => {
    if (event.key === "Enter") activate(row);
  };

  return (
    <div className={joinClassNames(CARD_CLASS_NAME, "overflow-x-auto")}>
      <table className="w-full min-w-xl text-left text-sm">
        <thead className="bg-gray-50 text-xs font-medium tracking-wider text-gray-500 uppercase">
          <tr>
            {columns.map(({ key, header, className, sortField }) => {
              const isSorted = Boolean(sortField) && sorting?.field === sortField;

              return (
                <th
                  key={key}
                  scope="col"
                  aria-sort={isSorted && sorting ? ARIA_SORT[sorting.order] : undefined}
                  className={joinClassNames("px-4 py-3 font-medium", className)}
                >
                  {sortField && sorting ? (
                    <button
                      type="button"
                      onClick={() => sorting.onToggle(sortField)}
                      className={joinClassNames("inline-flex items-center gap-1 uppercase transition hover:text-ink", isSorted && "text-brand")}
                    >
                      {header}
                      <Icon name={isSorted ? (sorting.order === SORT_ORDERS.desc ? "arrowDown" : "arrowUp") : "arrowsUpDown"} className="size-3.5" />
                    </button>
                  ) : (
                    header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading &&
            SKELETON_ROW_KEYS.map((key) => (
              <tr key={key} className="animate-pulse">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4">
                    <div className="h-4 w-3/4 rounded bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))}
          {!isLoading && !rows?.length && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                {emptyText}
              </td>
            </tr>
          )}
          {!isLoading &&
            rows?.map((row) => {
              const isClickable = Boolean(onRowClick) && isRowClickable(row);

              return (
                <tr
                  key={getRowKey(row)}
                  tabIndex={isClickable ? 0 : undefined}
                  onClick={() => activate(row)}
                  onKeyDown={(event) => handleKeyDown(event, row)}
                  className={joinClassNames("transition", isClickable && "cursor-pointer hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none")}
                >
                  {columns.map(({ key, className, render }) => (
                    <td key={key} className={joinClassNames("px-4 py-3.5 text-gray-700", className)}>
                      {render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
