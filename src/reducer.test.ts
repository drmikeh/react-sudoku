import { describe, it, expect } from 'vitest';
import { gameReducer } from './reducer';
import type { GameState, CellState } from './types';

function makeCell(value: number | null, isClue: boolean, isError = false, candidates: number[] = []): CellState {
  return { value, candidates: new Set(candidates), isClue, isError };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  const solution = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => ((r * 9 + c) % 9) + 1)
  );
  const board: CellState[][] = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => makeCell(null, false))
  );
  return {
    board,
    solution,
    selectedCell: null,
    pencilMode: false,
    difficulty: 'easy',
    status: 'playing',
    elapsedSeconds: 0,
    hintsUsed: 0,
    lastChecked: false,
    ...overrides,
  };
}

describe('SELECT_CELL', () => {
  it('sets selectedCell and clears lastChecked', () => {
    const state = makeState({ lastChecked: true });
    const next = gameReducer(state, { type: 'SELECT_CELL', row: 3, col: 5 });
    expect(next.selectedCell).toEqual([3, 5]);
    expect(next.lastChecked).toBe(false);
  });
});

describe('ENTER_DIGIT (pencil off)', () => {
  it('sets value on selected non-clue cell', () => {
    const state = makeState({ selectedCell: [0, 0] });
    const next = gameReducer(state, { type: 'ENTER_DIGIT', digit: 5 });
    expect(next.board[0][0].value).toBe(5);
  });

  it('clears isError and candidates when entering a digit', () => {
    const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => makeCell(null, false)));
    board[0][0] = makeCell(3, false, true, [1, 2, 3]);
    const state = makeState({ board, selectedCell: [0, 0] });
    const next = gameReducer(state, { type: 'ENTER_DIGIT', digit: 5 });
    expect(next.board[0][0].isError).toBe(false);
    expect(next.board[0][0].candidates.size).toBe(0);
  });

  it('is a no-op on a clue cell', () => {
    const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => makeCell(null, false)));
    board[2][3] = makeCell(7, true);
    const state = makeState({ board, selectedCell: [2, 3] });
    const next = gameReducer(state, { type: 'ENTER_DIGIT', digit: 5 });
    expect(next.board[2][3].value).toBe(7);
  });

  it('removes the placed digit from candidates of peer cells (same row, col, box)', () => {
    const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => makeCell(null, false)));
    // Peer in same row
    board[0][5] = makeCell(null, false, false, [3, 7]);
    // Peer in same col
    board[4][0] = makeCell(null, false, false, [3, 5]);
    // Peer in same box (top-left box: rows 0-2, cols 0-2)
    board[2][2] = makeCell(null, false, false, [3, 1]);
    // Non-peer: different row, col, and box
    board[5][5] = makeCell(null, false, false, [3, 8]);
    const state = makeState({ board, selectedCell: [0, 0] });
    const next = gameReducer(state, { type: 'ENTER_DIGIT', digit: 3 });
    expect(next.board[0][5].candidates.has(3)).toBe(false); // same row — removed
    expect(next.board[0][5].candidates.has(7)).toBe(true);  // other candidates preserved
    expect(next.board[4][0].candidates.has(3)).toBe(false); // same col — removed
    expect(next.board[2][2].candidates.has(3)).toBe(false); // same box — removed
    expect(next.board[5][5].candidates.has(3)).toBe(true);  // non-peer — unchanged
  });

  it('is a no-op when no cell is selected', () => {
    const state = makeState({ selectedCell: null });
    const next = gameReducer(state, { type: 'ENTER_DIGIT', digit: 5 });
    expect(next).toBe(state);
  });
});

describe('ENTER_DIGIT (pencil on)', () => {
  it('adds a candidate when not already present', () => {
    const state = makeState({ selectedCell: [0, 0], pencilMode: true });
    const next = gameReducer(state, { type: 'ENTER_DIGIT', digit: 3 });
    expect(next.board[0][0].candidates.has(3)).toBe(true);
    expect(next.board[0][0].value).toBeNull();
  });

  it('removes a candidate when already present (toggle)', () => {
    const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => makeCell(null, false)));
    board[0][0] = makeCell(null, false, false, [3, 5]);
    const state = makeState({ board, selectedCell: [0, 0], pencilMode: true });
    const next = gameReducer(state, { type: 'ENTER_DIGIT', digit: 3 });
    expect(next.board[0][0].candidates.has(3)).toBe(false);
    expect(next.board[0][0].candidates.has(5)).toBe(true);
  });

  it('is a no-op on a clue cell', () => {
    const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => makeCell(null, false)));
    board[1][1] = makeCell(4, true);
    const state = makeState({ board, selectedCell: [1, 1], pencilMode: true });
    const next = gameReducer(state, { type: 'ENTER_DIGIT', digit: 3 });
    expect(next.board[1][1].candidates.size).toBe(0);
  });
});

describe('ERASE', () => {
  it('clears value, candidates, and isError', () => {
    const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => makeCell(null, false)));
    board[0][0] = makeCell(5, false, true, [1, 2]);
    const state = makeState({ board, selectedCell: [0, 0] });
    const next = gameReducer(state, { type: 'ERASE' });
    expect(next.board[0][0].value).toBeNull();
    expect(next.board[0][0].isError).toBe(false);
    expect(next.board[0][0].candidates.size).toBe(0);
  });

  it('is a no-op on a clue cell', () => {
    const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => makeCell(null, false)));
    board[0][0] = makeCell(5, true);
    const state = makeState({ board, selectedCell: [0, 0] });
    const next = gameReducer(state, { type: 'ERASE' });
    expect(next.board[0][0].value).toBe(5);
  });
});

describe('TOGGLE_PENCIL_MODE', () => {
  it('flips pencilMode from false to true', () => {
    const state = makeState({ pencilMode: false });
    expect(gameReducer(state, { type: 'TOGGLE_PENCIL_MODE' }).pencilMode).toBe(true);
  });

  it('flips pencilMode from true to false', () => {
    const state = makeState({ pencilMode: true });
    expect(gameReducer(state, { type: 'TOGGLE_PENCIL_MODE' }).pencilMode).toBe(false);
  });
});

describe('CHECK', () => {
  it('marks incorrect cells as errors', () => {
    const solution = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ((r * 9 + c) % 9) + 1)
    );
    const board: CellState[][] = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => makeCell(null, false))
    );
    board[0][0] = makeCell(9, false); // wrong (solution[0][0] = 1)
    const state = makeState({ board, solution });
    const next = gameReducer(state, { type: 'CHECK' });
    expect(next.board[0][0].isError).toBe(true);
    expect(next.lastChecked).toBe(true);
  });

  it('does not mark correct cells as errors', () => {
    const solution = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ((r * 9 + c) % 9) + 1)
    );
    const board: CellState[][] = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => makeCell(null, false))
    );
    board[0][0] = makeCell(1, false); // correct (solution[0][0] = 1)
    const state = makeState({ board, solution });
    const next = gameReducer(state, { type: 'CHECK' });
    expect(next.board[0][0].isError).toBe(false);
  });

  it('sets status to won when all cells are correct and filled', () => {
    const solution = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ((r * 9 + c) % 9) + 1)
    );
    const board: CellState[][] = solution.map(row => row.map(v => makeCell(v, false)));
    const state = makeState({ board, solution });
    const next = gameReducer(state, { type: 'CHECK' });
    expect(next.status).toBe('won');
  });

  it('does not set status to won when some cells are empty', () => {
    const solution = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ((r * 9 + c) % 9) + 1)
    );
    const board: CellState[][] = solution.map(row => row.map(v => makeCell(v, false)));
    board[4][4] = makeCell(null, false);
    const state = makeState({ board, solution });
    const next = gameReducer(state, { type: 'CHECK' });
    expect(next.status).toBe('playing');
  });
});

describe('HINT', () => {
  it('fills a cell with the correct solution value', () => {
    const solution = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ((r * 9 + c) % 9) + 1)
    );
    const board: CellState[][] = solution.map(row => row.map(v => makeCell(v, false)));
    board[4][4] = makeCell(null, false); // only empty cell
    const state = makeState({ board, solution });
    const next = gameReducer(state, { type: 'HINT' });
    expect(next.board[4][4].value).toBe(solution[4][4]);
    expect(next.hintsUsed).toBe(1);
  });

  it('increments hintsUsed', () => {
    const solution = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ((r * 9 + c) % 9) + 1)
    );
    const board: CellState[][] = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => makeCell(null, false))
    );
    const state = makeState({ board, solution, hintsUsed: 2 });
    const next = gameReducer(state, { type: 'HINT' });
    expect(next.hintsUsed).toBe(3);
  });

  it('is a no-op when status is won', () => {
    const state = makeState({ status: 'won' });
    const next = gameReducer(state, { type: 'HINT' });
    expect(next).toBe(state);
  });
});

describe('TICK', () => {
  it('increments elapsedSeconds when playing', () => {
    const state = makeState({ elapsedSeconds: 42 });
    const next = gameReducer(state, { type: 'TICK' });
    expect(next.elapsedSeconds).toBe(43);
  });

  it('does not increment elapsedSeconds when status is won', () => {
    const state = makeState({ status: 'won', elapsedSeconds: 42 });
    const next = gameReducer(state, { type: 'TICK' });
    expect(next.elapsedSeconds).toBe(42);
  });
});

describe('NEW_GAME', () => {
  it('resets elapsedSeconds to 0', () => {
    const state = makeState({ elapsedSeconds: 999 });
    const next = gameReducer(state, { type: 'NEW_GAME', difficulty: 'easy' });
    expect(next.elapsedSeconds).toBe(0);
  });

  it('resets hintsUsed to 0', () => {
    const state = makeState({ hintsUsed: 5 });
    const next = gameReducer(state, { type: 'NEW_GAME', difficulty: 'medium' });
    expect(next.hintsUsed).toBe(0);
  });

  it('resets status to playing', () => {
    const state = makeState({ status: 'won' });
    const next = gameReducer(state, { type: 'NEW_GAME', difficulty: 'hard' });
    expect(next.status).toBe('playing');
  });

  it('sets the requested difficulty', () => {
    const state = makeState({ difficulty: 'easy' });
    const next = gameReducer(state, { type: 'NEW_GAME', difficulty: 'hard' });
    expect(next.difficulty).toBe('hard');
  });
});
