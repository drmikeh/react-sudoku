import { describe, it, expect } from 'vitest';
import { isValidPlacement } from './sudokuLogic';

function emptyBoard(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

describe('isValidPlacement', () => {
  it('returns true for a digit in an empty board', () => {
    expect(isValidPlacement(emptyBoard(), 0, 0, 5)).toBe(true);
  });

  it('returns false when digit already exists in the same row', () => {
    const board = emptyBoard();
    board[0][3] = 5;
    expect(isValidPlacement(board, 0, 0, 5)).toBe(false);
  });

  it('returns false when digit already exists in the same column', () => {
    const board = emptyBoard();
    board[4][0] = 5;
    expect(isValidPlacement(board, 0, 0, 5)).toBe(false);
  });

  it('returns false when digit already exists in the same 3×3 box', () => {
    const board = emptyBoard();
    board[2][2] = 5;
    expect(isValidPlacement(board, 0, 0, 5)).toBe(false);
  });

  it('returns true when digit exists in a different row, col, and box', () => {
    const board = emptyBoard();
    board[0][3] = 5;
    board[4][6] = 5;
    // Placing 5 at (6,0): different row, different col, different box from both
    expect(isValidPlacement(board, 6, 0, 5)).toBe(true);
  });
});
