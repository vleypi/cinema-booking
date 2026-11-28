import { joinClassNames } from "@luch/shared/lib";
import { BUTTON_SIZES, BUTTON_VARIANTS, type ButtonSize, type ButtonVariant } from "@/shared/ui/ui.constant";

const BUTTON_BASE_CLASS_NAME =
  "group inline-flex items-center justify-center gap-2.5 rounded-full border border-transparent font-medium whitespace-nowrap transition-colors duration-350 ease-out-expo disabled:cursor-not-allowed disabled:opacity-35";

export interface IButtonLookProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export const getButtonClassName = ({ variant = "light", size = "regular", className }: IButtonLookProps): string =>
  joinClassNames(BUTTON_BASE_CLASS_NAME, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className);
