import type { ReactNode } from "react";
import { LIST_TEXT } from "@/shared/config";
import { SearchField } from "@/shared/ui/SearchField";

interface IListToolbarProps {
  search: string;
  placeholder: string;
  total: number | undefined;
  onSearch: (value: string) => void;
  children?: ReactNode;
}

export const ListToolbar = ({ search, placeholder, total, onSearch, children }: IListToolbarProps) => (
  <div className="mb-4 flex flex-wrap items-center gap-3">
    <SearchField value={search} placeholder={placeholder} onSearch={onSearch} />
    {search && total !== undefined && (
      <p className="text-sm text-gray-500 tabular-nums">
        {LIST_TEXT.found}: {total}
      </p>
    )}
    {children && <div className="ml-auto">{children}</div>}
  </div>
);
