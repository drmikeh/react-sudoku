import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './puzzleGenerator';

function isValidSolution(solution: number[][]): boolean {
  const digits = new Set([1,2,3,4,5,6,7,8,9]);
  for (let r = 0; r < 9; r++) {
    if (new Set(solution[r]).size !== 9) return false;
    if (!solution[r].every(d => digits.has(d))) return false;
  }
  for (let c = 0; c < 9; c++) {
    if (new Set(solution.map(row => row[c])).size !== 9) return false;
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const box = new Set<number>();
      for (let r = br * 3; r < br * 3 + 3; r++)
        for (let c = bc * 3; c < bc * 3 + 3; c++)
          box.add(solution[r][c]);
      if (box.size !== 9) return false;
    }
  }
  return true;
}

describe('generatePuzzle', () => {
  it('generates a valid complete solution', () => {
    const { solution } = generatePuzzle('easy');
    expect(isValidSolution(solution)).toBe(true);
  });

  it('easy puzzle has approximately 45 clues (40–50 range)', () => {
    const { puzzle } = generatePuzzle('easy');
    const clues = puzzle.flat().filter(v => v !== null).length;
    expect(clues).toBeGreaterThanOrEqual(40);
    expect(clues).toBeLessThanOrEqual(50);
  });

  it('medium puzzle has approximately 35 clues (30–40 range)', () => {
    const { puzzle } = generatePuzzle('medium');
    const clues = puzzle.flat().filter(v => v !== null).length;
    expect(clues).toBeGreaterThanOrEqual(30);
    expect(clues).toBeLessThanOrEqual(40);
  });

  it('hard puzzle has approximately 25 clues (20–30 range)', () => {
    const { puzzle } = generatePuzzle('hard');
    const clues = puzzle.flat().filter(v => v !== null).length;
    expect(clues).toBeGreaterThanOrEqual(20);
    expect(clues).toBeLessThanOrEqual(30);
  });

  it('puzzle clue values match the solution at non-null positions', () => {
    const { puzzle, solution } = generatePuzzle('medium');
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (puzzle[r][c] !== null)
          expect(puzzle[r][c]).toBe(solution[r][c]);
  });
});
