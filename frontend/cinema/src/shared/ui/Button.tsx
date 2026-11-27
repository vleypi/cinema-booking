import type { ComponentProps } from "react";
import { getButtonClassName, type IButtonLookProps } from "@/shared/ui/button.util";

type IButtonProps = IButtonLookProps & Omit<ComponentProps<"button">, "className">;

export const Button = ({ variant, size, className, type = "button", ...buttonProps }: IButtonProps) => (
  <button type={type} className={getButtonClassName({ variant, size, className })} {...buttonProps} />
);
