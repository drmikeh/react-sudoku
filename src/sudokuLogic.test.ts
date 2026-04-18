import { describe, it, expect } from 'vitest';
import { isValidPlacement, isSolved, pickHintCell } from './sudokuLogic';
import type { CellState } from './types';

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

function makeCell(value: number | null, isClue: boolean, isError = false): CellState {
  return { value, candidates: new Set(), isClue, isError };
}

function solutionGrid(): number[][] {
  return [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9],
  ];
}

function solvedBoard(solution: number[][]): CellState[][] {
  return solution.map(row => row.map(v => makeCell(v, false)));
}

describe('isSolved', () => {
  it('returns true when all non-clue cells match the solution', () => {
    const solution = solutionGrid();
    expect(isSolved(solvedBoard(solution), solution)).toBe(true);
  });

  it('returns false when a non-clue cell has the wrong value', () => {
    const solution = solutionGrid();
    const board = solvedBoard(solution);
    board[0][0] = makeCell(9, false);
    expect(isSolved(board, solution)).toBe(false);
  });

  it('returns false when a non-clue cell is empty', () => {
    const solution = solutionGrid();
    const board = solvedBoard(solution);
    board[0][0] = makeCell(null, false);
    expect(isSolved(board, solution)).toBe(false);
  });

  it('skips clue cells when checking correctness', () => {
    const solution = solutionGrid();
    const board = solvedBoard(solution);
    // Mark all cells as clues except (0,0) which is correct
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (!(r === 0 && c === 0)) board[r][c] = makeCell(solution[r][c], true);
    expect(isSolved(board, solution)).toBe(true);
  });
});

describe('pickHintCell', () => {
  it('returns null when all non-clue cells are correctly filled', () => {
    const solution = solutionGrid();
    expect(pickHintCell(solvedBoard(solution), solution)).toBeNull();
  });

  it('returns the position of an empty non-clue cell', () => {
    const solution = solutionGrid();
    const board = solvedBoard(solution);
    board[4][4] = makeCell(null, false);
    expect(pickHintCell(board, solution)).toEqual([4, 4]);
  });

  it('returns the position of an incorrect non-clue cell', () => {
    const solution = solutionGrid();
    const board = solvedBoard(solution);
    board[4][4] = makeCell(9, false);
    expect(pickHintCell(board, solution)).toEqual([4, 4]);
  });

  it('never returns a clue cell', () => {
    const solution = solutionGrid();
    const board = solvedBoard(solution);
    board[0][0] = makeCell(9, true); // wrong value but is a clue
    board[4][4] = makeCell(null, false); // only eligible cell
    expect(pickHintCell(board, solution)).toEqual([4, 4]);
  });
});
