import { joinClassNames } from "@luch/shared/lib";
import type { KeyboardEvent, ReactNode } from "react";

export interface IDataTableColumn<TRow> {
  key: string;
  header: string;
  className?: string;
  render: (row: TRow) => ReactNode;
}

interface IDataTableProps<TRow> {
  columns: readonly IDataTableColumn<TRow>[];
  rows: readonly TRow[] | undefined;
  getRowKey: (row: TRow) => string;
  isLoading: boolean;
  emptyText: string;
  onRowClick?: (row: TRow) => void;
  isRowClickable?: (row: TRow) => boolean;
}

const SKELETON_ROW_KEYS = ["first", "second", "third", "fourth"] as const;

export const DataTable = <TRow,>({ columns, rows, getRowKey, isLoading, emptyText, onRowClick, isRowClickable = () => true }: IDataTableProps<TRow>) => {
  const activate = (row: TRow) => {
    if (onRowClick && isRowClickable(row)) onRowClick(row);
  };

  const handleKeyDown = (event: KeyboardEvent, row: TRow) => {
    if (event.key === "Enter") activate(row);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-xl text-left text-sm">
        <thead className="bg-gray-50 text-xs font-medium tracking-wider text-gray-500 uppercase">
          <tr>
            {columns.map(({ key, header, className }) => (
              <th key={key} scope="col" className={joinClassNames("px-4 py-3 font-medium", className)}>
                {header}
              </th>
            ))}
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
