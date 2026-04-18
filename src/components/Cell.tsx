import type { CellState } from '../types';

type Props = {
  cell: CellState;
  isSelected: boolean;
  isPeer: boolean;
  isSameDigit: boolean;
  onClick: () => void;
};

export default function Cell({ cell, isSelected, isPeer, isSameDigit, onClick }: Props) {
  const classNames = ['cell'];
  if (cell.isClue) classNames.push('cell--clue');
  if (isSelected) classNames.push('cell--selected');
  else if (isPeer) classNames.push('cell--peer');
  if (isSameDigit && !isSelected && cell.value !== null) classNames.push('cell--same-digit');
  if (cell.isError) classNames.push('cell--error');

  return (
    <div className={classNames.join(' ')} onClick={onClick}>
      {cell.value !== null ? (
        <span className="cell__value">{cell.value}</span>
      ) : cell.candidates.size > 0 ? (
        <div className="cell__candidates">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <span key={n} className="cell__candidate">
              {cell.candidates.has(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
