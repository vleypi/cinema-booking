"use client";

import { joinClassNames } from "@luch/shared/lib";
import type { ReactNode } from "react";
import { getItemDelayClassName, useInView } from "@/shared/lib";

interface IRevealProps {
  order?: number;
  className?: string;
  children: ReactNode;
}

export const Reveal = ({ order = 0, className, children }: IRevealProps) => {
  const { ref, isVisible } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-visible={isVisible || undefined}
      className={joinClassNames(
        "translate-y-8 opacity-0 transition duration-950 ease-out-expo data-visible:translate-y-0 data-visible:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100",
        getItemDelayClassName(order),
        className,
      )}
    >
      {children}
    </div>
  );
};
