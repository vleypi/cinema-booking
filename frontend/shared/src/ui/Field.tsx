import type { ReactNode } from "react";

interface IFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export const Field = ({ id, label, error, hint, children }: IFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-semibold tracking-wide text-gray-700 uppercase">
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-sm text-red-500">
        {error}
      </p>
    ) : (
      hint && <p className="text-xs text-gray-400">{hint}</p>
    )}
  </div>
);
