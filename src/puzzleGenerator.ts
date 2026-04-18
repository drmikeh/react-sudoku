import type { Difficulty } from './types';
import { isValidPlacement } from './sudokuLogic';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillBox(board: number[][], startRow: number, startCol: number): void {
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let i = 0;
  for (let r = startRow; r < startRow + 3; r++)
    for (let c = startCol; c < startCol + 3; c++)
      board[r][c] = digits[i++];
}

function solve(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) continue;
      for (const digit of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (isValidPlacement(board, row, col, digit)) {
          board[row][col] = digit;
          if (solve(board)) return true;
          board[row][col] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

function generateSolution(): number[][] {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  // Pre-fill diagonal boxes — they don't constrain each other, giving backtracking a fast seed
  fillBox(board, 0, 0);
  fillBox(board, 3, 3);
  fillBox(board, 6, 6);
  solve(board);
  return board;
}

const CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 36,
  medium: 46,
  hard: 56,
};

export function generatePuzzle(difficulty: Difficulty): {
  puzzle: (number | null)[][];
  solution: number[][];
} {
  const solution = generateSolution();
  const puzzle: (number | null)[][] = solution.map(row => [...row] as (number | null)[]);
  const toRemove = CELLS_TO_REMOVE[difficulty];

  // Positions 0–39 each pair symmetrically with their 180° counterpart (8-row, 8-col)
  const indices = shuffle(Array.from({ length: 40 }, (_, i) => i));

  let removed = 0;
  for (const i of indices) {
    if (removed >= toRemove) break;
    const row = Math.floor(i / 9);
    const col = i % 9;
    puzzle[row][col] = null;
    removed++;
    if (removed < toRemove) {
      puzzle[8 - row][8 - col] = null;
      removed++;
    }
  }

  return { puzzle, solution };
}
