import { generatePuzzle } from './puzzleGenerator';
import { pickHintCell, isValidPlacement } from './sudokuLogic';
import type { GameState, Action, Difficulty, CellState } from './types';

function cloneBoard(board: CellState[][]): CellState[][] {
  return board.map(row => row.map(cell => ({ ...cell, candidates: new Set(cell.candidates) })));
}

function createBoard(puzzle: (number | null)[][]): CellState[][] {
  return puzzle.map(row =>
    row.map(value => ({
      value,
      candidates: new Set<number>(),
      isClue: value !== null,
      isError: false,
    }))
  );
}

export function createInitialState(difficulty: Difficulty): GameState {
  const { puzzle, solution } = generatePuzzle(difficulty);
  return {
    board: createBoard(puzzle),
    solution,
    selectedCell: null,
    pencilMode: false,
    difficulty,
    status: 'playing',
    elapsedSeconds: 0,
    hintsUsed: 0,
    lastChecked: false,
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_CELL':
      return { ...state, selectedCell: [action.row, action.col], lastChecked: false };

    case 'ENTER_DIGIT': {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;
      if (state.board[row][col].isClue) return state;
      const board = cloneBoard(state.board);
      if (state.pencilMode) {
        const candidates = new Set(board[row][col].candidates);
        if (candidates.has(action.digit)) candidates.delete(action.digit);
        else candidates.add(action.digit);
        board[row][col] = { ...board[row][col], candidates };
      } else {
        board[row][col] = { ...board[row][col], value: action.digit, isError: false, candidates: new Set() };
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (r === row && c === col) continue;
            if (r === row || c === col || (Math.floor(r / 3) * 3 === boxRow && Math.floor(c / 3) * 3 === boxCol)) {
              board[r][c].candidates.delete(action.digit);
            }
          }
        }
      }
      return { ...state, board, lastChecked: false };
    }

    case 'ERASE': {
      if (!state.selectedCell) return state;
      const [row, col] = state.selectedCell;
      if (state.board[row][col].isClue) return state;
      const board = cloneBoard(state.board);
      board[row][col] = { ...board[row][col], value: null, candidates: new Set(), isError: false };
      return { ...state, board, lastChecked: false };
    }

    case 'TOGGLE_PENCIL_MODE':
      return { ...state, pencilMode: !state.pencilMode };

    case 'CHECK': {
      const board = cloneBoard(state.board);
      let allCorrect = true;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = board[r][c];
          if (!cell.isClue) {
            if (cell.value === null) {
              allCorrect = false;
            } else if (cell.value !== state.solution[r][c]) {
              board[r][c] = { ...cell, isError: true };
              allCorrect = false;
            }
          }
        }
      }
      return { ...state, board, lastChecked: true, status: allCorrect ? 'won' : state.status };
    }

    case 'HINT': {
      if (state.status === 'won') return state;
      const hintPos = pickHintCell(state.board, state.solution);
      if (!hintPos) return state;
      const [row, col] = hintPos;
      const board = cloneBoard(state.board);
      board[row][col] = {
        ...board[row][col],
        value: state.solution[row][col],
        candidates: new Set(),
        isError: false,
      };
      return { ...state, board, hintsUsed: state.hintsUsed + 1 };
    }

    case 'TICK':
      if (state.status === 'won') return state;
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case 'FILL_CANDIDATES': {
      const values = state.board.map(row => row.map(cell => cell.value ?? 0));
      const board = cloneBoard(state.board);
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = board[r][c];
          if (!cell.isClue && cell.value === null) {
            const candidates = new Set<number>();
            for (let d = 1; d <= 9; d++) {
              if (isValidPlacement(values, r, c, d)) candidates.add(d);
            }
            board[r][c] = { ...cell, candidates };
          }
        }
      }
      return { ...state, board };
    }

    case 'NEW_GAME':
      return createInitialState(action.difficulty);

    default:
      return state;
  }
}
