import Link from "next/link";
import type { ComponentProps } from "react";
import { getButtonClassName, type IButtonLookProps } from "@/shared/ui/button.util";

type IButtonLinkProps = IButtonLookProps & Omit<ComponentProps<typeof Link>, "className">;

export const ButtonLink = ({ variant, size, className, ...linkProps }: IButtonLinkProps) => (
  <Link className={getButtonClassName({ variant, size, className })} {...linkProps} />
);
