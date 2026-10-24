import type { ReactNode } from "react";

interface IPageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, actions }: IPageHeaderProps) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <p className="mt-0.5 text-sm text-gray-400">{description}</p>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
