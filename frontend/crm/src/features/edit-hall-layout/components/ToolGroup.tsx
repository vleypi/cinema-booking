import type { ReactNode } from "react";

interface IToolGroupProps {
  label: string;
  children: ReactNode;
}

export const ToolGroup = ({ label, children }: IToolGroupProps) => (
  <div role="group" aria-label={label} className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold tracking-wide text-gray-700 uppercase">{label}</span>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);
