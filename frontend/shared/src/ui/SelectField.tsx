import { type ComponentProps, useId } from "react";
import { joinClassNames } from "../lib/join-class-names";
import { Field } from "./Field";
import { CONTROL_BORDER_CLASSES, CONTROL_CLASS_NAME } from "./field.constant";

export interface ISelectOption {
  value: string;
  label: string;
}

interface ISelectFieldProps extends ComponentProps<"select"> {
  label: string;
  options: readonly ISelectOption[];
  error?: string;
  hint?: string;
}

export const SelectField = ({ label, options, error, hint, className, ...props }: ISelectFieldProps) => {
  const id = useId();

  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        className={joinClassNames(CONTROL_CLASS_NAME, CONTROL_BORDER_CLASSES[error ? "invalid" : "valid"], "appearance-auto", className)}
        {...props}
      >
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  );
};
