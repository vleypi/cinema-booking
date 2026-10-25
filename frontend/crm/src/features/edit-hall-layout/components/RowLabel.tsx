interface IRowLabelProps {
  number: number | undefined;
}

export const RowLabel = ({ number }: IRowLabelProps) => <span className="w-6 shrink-0 text-center text-xs text-gray-500 tabular-nums">{number}</span>;
