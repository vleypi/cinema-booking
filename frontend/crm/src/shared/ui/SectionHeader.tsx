import type { ReactNode } from "react";

interface ISectionHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export const SectionHeader = ({ title, description, actions }: ISectionHeaderProps) => (
  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-400">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
