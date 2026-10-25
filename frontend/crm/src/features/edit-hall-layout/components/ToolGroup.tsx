import { LABEL_CLASS_NAME } from "@luch/shared/ui";
import type { ReactNode } from "react";

interface IToolGroupProps {
  label: string;
  children: ReactNode;
}

export const ToolGroup = ({ label, children }: IToolGroupProps) => (
  <div role="group" aria-label={label} className="flex flex-col gap-1.5">
    <span className={LABEL_CLASS_NAME}>{label}</span>
    <div className="flex flex-wrap gap-1.5">{children}</div>
  </div>
);
