# React Sudoku

A single-player Sudoku puzzle game built with React, TypeScript, and Vite.

## Features

- **Algorithmically generated puzzles** — unique board every game via backtracking with 180° symmetric cell removal
- **Three difficulty levels** — Easy (~45 clues), Medium (~35 clues), Hard (~25 clues)
- **Pencil mode** — toggle between placing guesses and pencilling in candidates
- **Check** — verify all placed digits; wrong answers highlighted in red
- **Hint** — reveal one empty or incorrect cell
- **Live timer** — tracks solve time; stops on completion
- **Win modal** — shows time taken, hints used, and difficulty on completion
- **Keyboard support** — digits 1–9, Backspace/Delete, `p` for pencil mode, arrow keys to navigate

## Getting Started

```bash
npm install
npm run dev       # Start dev server at http://localhost:5173
```

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Type-check + production build
npm run lint      # Run ESLint
npm run test      # Run Vitest in watch mode
npm run test:ci   # Run Vitest once (non-interactive)
npm run preview   # Preview the production build
```

## Architecture

The code is split into four distinct layers:

### Pure logic (no React)
- **`src/types.ts`** — Shared TypeScript types: `Board`, `CellState`, `GameState`, `Action`, `Difficulty`, `GameStatus`
- **`src/sudokuLogic.ts`** — Pure validation and hint selection: `isValidPlacement`, `isSolved`, `pickHintCell`
- **`src/puzzleGenerator.ts`** — Backtracking solution generator with randomized digit order; removes cells symmetrically by difficulty

### State management
- **`src/reducer.ts`** — `gameReducer` + `createInitialState`. Handles eight actions: `SELECT_CELL`, `ENTER_DIGIT`, `ERASE`, `TOGGLE_PENCIL_MODE`, `CHECK`, `HINT`, `TICK`, `NEW_GAME`

### React UI
- **`src/App.tsx`** — Wires state via `useReducer`. Timer `useEffect` dispatches `TICK` every second while playing. Keyboard handler via `useCallback` + `useEffect`.
- **`src/components/`** — Six presentational components: `Board`, `Cell`, `Controls`, `GameHeader`, `ActionBar`, `WinModal`

### Data flow

```
User click/keypress
  → App dispatches action
  → gameReducer updates state
  → Components re-render

Timer (setInterval, 1s)
  → TICK action
  → elapsedSeconds increments

Check button
  → CHECK action
  → Wrong cells marked isError=true
  → If all correct and filled → status = 'won' → WinModal shown
```

## Key Invariants

- Only non-clue cells are editable. `isClue` cells are immutable throughout the game.
- `ENTER_DIGIT` in pencil mode toggles the digit in `candidates`; outside pencil mode it sets `value` and clears `candidates` and `isError`.
- `solution` is stored in state but never shown directly — used only by `CHECK` and `HINT`.
- `pickHintCell` never returns a clue cell; returns `null` when no incorrect or empty non-clue cells remain.
- Tests live in `src/*.test.ts` using Vitest with `happy-dom`.
