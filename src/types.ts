export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'won';

export type CellState = {
  value: number | null;
  candidates: Set<number>;
  isClue: boolean;
  isError: boolean;
};

export type GameState = {
  board: CellState[][];
  solution: number[][];
  selectedCell: [number, number] | null;
  pencilMode: boolean;
  difficulty: Difficulty;
  status: GameStatus;
  elapsedSeconds: number;
  hintsUsed: number;
  lastChecked: boolean;
};

export type Action =
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'ENTER_DIGIT'; digit: number }
  | { type: 'ERASE' }
  | { type: 'TOGGLE_PENCIL_MODE' }
  | { type: 'CHECK' }
  | { type: 'HINT' }
  | { type: 'TICK' }
  | { type: 'NEW_GAME'; difficulty: Difficulty };
