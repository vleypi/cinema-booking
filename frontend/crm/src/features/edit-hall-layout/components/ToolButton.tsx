import { joinClassNames } from "@luch/shared/lib";
import type { ReactNode } from "react";

interface IToolButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}

export const ToolButton = ({ isActive, onClick, children }: IToolButtonProps) => (
  <button
    type="button"
    aria-pressed={isActive}
    onClick={onClick}
    className={joinClassNames(
      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition",
      isActive ? "border-brand bg-brand-soft text-brand" : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50",
    )}
  >
    {children}
  </button>
);
