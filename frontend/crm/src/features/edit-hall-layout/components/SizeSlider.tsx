import { useId } from "react";

interface ISizeSliderProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}

const MIN_SIZE = 1;

export const SizeSlider = ({ label, value, max, onChange }: ISizeSliderProps) => {
  const id = useId();

  return (
    <div className="flex min-w-40 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="flex justify-between text-xs font-semibold tracking-wide text-gray-700 uppercase">
        {label}
        <span className="text-ink tabular-nums">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={MIN_SIZE}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-brand"
      />
    </div>
  );
};
