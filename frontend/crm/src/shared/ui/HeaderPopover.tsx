import { joinClassNames } from "@luch/shared/lib";
import type { ReactNode, Ref } from "react";

interface IHeaderPopoverProps {
  id: string;
  className: string;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const HeaderPopover = ({ id, className, ref, children }: IHeaderPopoverProps) => (
  <div
    ref={ref}
    id={id}
    popover="auto"
    className={joinClassNames(
      "fixed inset-auto top-header m-0 mt-2 -translate-y-1 rounded-2xl border border-gray-100 bg-white opacity-0 shadow-lg transition-all transition-discrete duration-150 ease-out-expo open:translate-y-0 open:opacity-100 starting:open:-translate-y-1 starting:open:opacity-0",
      className,
    )}
  >
    {children}
  </div>
);
