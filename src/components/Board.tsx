import type { CellState } from '../types';
import Cell from './Cell';

type Props = {
  board: CellState[][];
  selectedCell: [number, number] | null;
  onSelectCell: (row: number, col: number) => void;
};

function isPeer(row: number, col: number, selectedCell: [number, number] | null): boolean {
  if (!selectedCell) return false;
  const [sr, sc] = selectedCell;
  return (
    row === sr ||
    col === sc ||
    (Math.floor(row / 3) === Math.floor(sr / 3) && Math.floor(col / 3) === Math.floor(sc / 3))
  );
}

export default function Board({ board, selectedCell, onSelectCell }: Props) {
  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]].value : null;

  return (
    <div className="board">
      {board.map((row, r) =>
        row.map((cell, c) => (
          <Cell
            key={`${r}-${c}`}
            cell={cell}
            isSelected={selectedCell !== null && selectedCell[0] === r && selectedCell[1] === c}
            isPeer={isPeer(r, c, selectedCell)}
            isSameDigit={selectedValue !== null && cell.value === selectedValue}
            onClick={() => onSelectCell(r, c)}
          />
        ))
      )}
    </div>
  );
}
