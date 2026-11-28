import { joinClassNames } from "@luch/shared/lib";

interface IBrandMarkProps {
  className?: string;
}

export const BrandMark = ({ className }: IBrandMarkProps) => (
  <svg viewBox="0 0 32 32" aria-hidden className={joinClassNames("fill-paper", className)}>
    <path d="M4 9 28 4v24L4 23z" />
  </svg>
);
