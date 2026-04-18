import type { CellState } from './types';

export function isValidPlacement(board: number[][], row: number, col: number, digit: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === digit) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === digit) return false;
  }
  // Check 3×3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === digit) return false;
    }
  }
  return true;
}

export function isSolved(_board: CellState[][], _solution: number[][]): boolean {
  throw new Error('not implemented');
}

export function pickHintCell(_board: CellState[][], _solution: number[][]): [number, number] | null {
  throw new Error('not implemented');
}
