import { joinClassNames } from "../lib/join-class-names";
import { ICON_PATHS, type IconName } from "./icons.constant";

interface IIconProps {
  name: IconName;
  className?: string;
}

export const Icon = ({ name, className }: IIconProps) => (
  <svg className={joinClassNames("size-5 shrink-0", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON_PATHS[name]} />
  </svg>
);
