import './App.css';
import { useReducer, useEffect, useCallback } from 'react';
import { gameReducer, createInitialState } from './reducer';
import type { Difficulty } from './types';
import Board from './components/Board';
import Controls from './components/Controls';
import GameHeader from './components/GameHeader';
import ActionBar from './components/ActionBar';
import WinModal from './components/WinModal';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState('easy'));

  useEffect(() => {
    if (state.status !== 'playing') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '9') {
      dispatch({ type: 'ENTER_DIGIT', digit: parseInt(e.key) });
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      dispatch({ type: 'ERASE' });
    } else if (e.key === 'p') {
      dispatch({ type: 'TOGGLE_PENCIL_MODE' });
    } else if (e.key === 'ArrowUp' && state.selectedCell) {
      const [r, c] = state.selectedCell;
      if (r > 0) dispatch({ type: 'SELECT_CELL', row: r - 1, col: c });
    } else if (e.key === 'ArrowDown' && state.selectedCell) {
      const [r, c] = state.selectedCell;
      if (r < 8) dispatch({ type: 'SELECT_CELL', row: r + 1, col: c });
    } else if (e.key === 'ArrowLeft' && state.selectedCell) {
      const [r, c] = state.selectedCell;
      if (c > 0) dispatch({ type: 'SELECT_CELL', row: r, col: c - 1 });
    } else if (e.key === 'ArrowRight' && state.selectedCell) {
      const [r, c] = state.selectedCell;
      if (c < 8) dispatch({ type: 'SELECT_CELL', row: r, col: c + 1 });
    }
  }, [state.selectedCell]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleNewGame = (difficulty: Difficulty) =>
    dispatch({ type: 'NEW_GAME', difficulty });

  return (
    <div className="app">
      <h1 className="app__title">Sudoku</h1>
      <GameHeader
        difficulty={state.difficulty}
        elapsedSeconds={state.elapsedSeconds}
        onNewGame={handleNewGame}
      />
      <Board
        board={state.board}
        selectedCell={state.selectedCell}
        onSelectCell={(r, c) => dispatch({ type: 'SELECT_CELL', row: r, col: c })}
      />
      <ActionBar
        hintsUsed={state.hintsUsed}
        onCheck={() => dispatch({ type: 'CHECK' })}
        onHint={() => dispatch({ type: 'HINT' })}
      />
      <Controls
        pencilMode={state.pencilMode}
        onDigit={d => dispatch({ type: 'ENTER_DIGIT', digit: d })}
        onErase={() => dispatch({ type: 'ERASE' })}
        onTogglePencil={() => dispatch({ type: 'TOGGLE_PENCIL_MODE' })}
      />
      {state.status === 'won' && (
        <WinModal
          elapsedSeconds={state.elapsedSeconds}
          hintsUsed={state.hintsUsed}
          difficulty={state.difficulty}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
