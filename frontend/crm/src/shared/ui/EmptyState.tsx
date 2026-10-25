import { Icon, type IconName } from "@luch/shared/ui";
import type { ReactNode } from "react";

interface IEmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: IEmptyStateProps) => (
  <div className="flex flex-col items-center px-4 py-16 text-center">
    <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
      <Icon name={icon} className="size-6" />
    </div>
    <h2 className="text-base font-semibold text-ink">{title}</h2>
    <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
