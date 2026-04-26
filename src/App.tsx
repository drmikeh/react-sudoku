import './App.css';
import { useReducer, useEffect, useCallback, useState, useMemo } from 'react';
import { gameReducer, createInitialState } from './reducer';
import type { Difficulty } from './types';
import Board from './components/Board';
import Controls from './components/Controls';
import GameHeader from './components/GameHeader';
import ActionBar from './components/ActionBar';
import WinModal from './components/WinModal';
import Toast from './components/Toast';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState('easy'));
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (state.status !== 'playing') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (!state.lastChecked || state.status === 'won') {
      setToastVisible(false);
      return;
    }
    const hasErrors = state.board.some(row => row.some(cell => cell.isError));
    if (hasErrors) return;
    setToastVisible(true);
    const id = setTimeout(() => setToastVisible(false), 2500);
    return () => clearTimeout(id);
  }, [state.lastChecked]);

  const completedDigits = useMemo(() => {
    const counts = new Array(10).fill(0);
    for (const row of state.board) {
      for (const cell of row) {
        if (cell.value !== null) counts[cell.value]++;
      }
    }
    const completed = new Set<number>();
    for (let d = 1; d <= 9; d++) {
      if (counts[d] === 9) completed.add(d);
    }
    return completed;
  }, [state.board]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '9') {
      const digit = parseInt(e.key);
      if (!completedDigits.has(digit)) dispatch({ type: 'ENTER_DIGIT', digit });
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
  }, [state.selectedCell, completedDigits]);

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
        onFillCandidates={() => dispatch({ type: 'FILL_CANDIDATES' })}
      />
      <Controls
        pencilMode={state.pencilMode}
        completedDigits={completedDigits}
        onDigit={d => dispatch({ type: 'ENTER_DIGIT', digit: d })}
        onErase={() => dispatch({ type: 'ERASE' })}
        onTogglePencil={() => dispatch({ type: 'TOGGLE_PENCIL_MODE' })}
      />
      <Toast message="Looking good! Keep it up." visible={toastVisible} />
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
