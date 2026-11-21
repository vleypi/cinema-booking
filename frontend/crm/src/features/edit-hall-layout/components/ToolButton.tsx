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
      "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition",
      isActive ? "bg-white text-ink shadow-sm" : "text-gray-600 hover:text-ink",
    )}
  >
    {children}
  </button>
);
