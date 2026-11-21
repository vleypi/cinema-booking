import { Icon, type IconName } from "@luch/shared/ui";
import { EDIT_LAYOUT_TEXT, LAYOUT_LIMITS } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";

interface ISizeStepperProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

interface IStepButtonProps {
  icon: IconName;
  label: string;
  disabled: boolean;
  onClick: () => void;
}

const StepButton = ({ icon, label, disabled, onClick }: IStepButtonProps) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="grid size-9 place-items-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-ink disabled:opacity-30"
  >
    <Icon name={icon} className="size-4" />
  </button>
);

export const SizeStepper = ({ label, value, max, onChange }: ISizeStepperProps) => (
  <div role="group" aria-label={label} className="flex items-center gap-1">
    <span className="mr-1 text-sm text-gray-500">{label}</span>
    <StepButton
      icon="minus"
      label={`${EDIT_LAYOUT_TEXT.decrease}: ${label}`}
      disabled={value <= LAYOUT_LIMITS.minSize}
      onClick={() => onChange(value - 1)}
    />
    <span className="w-6 text-center text-base font-semibold text-ink tabular-nums">{value}</span>
    <StepButton icon="plus" label={`${EDIT_LAYOUT_TEXT.increase}: ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} />
  </div>
);
