interface IRowLabelProps {
  number: number | undefined;
}

export const RowLabel = ({ number }: IRowLabelProps) => <span className="w-8 shrink-0 text-center text-sm text-gray-400 tabular-nums">{number}</span>;
