import type { Difficulty } from '../types';

type Props = {
  difficulty: Difficulty;
  elapsedSeconds: number;
  onNewGame: (difficulty: Difficulty) => void;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function GameHeader({ difficulty, elapsedSeconds, onNewGame }: Props) {
  return (
    <header className="game-header">
      <div className="game-header__left">
        <span className={`difficulty-badge difficulty-badge--${difficulty}`}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
      </div>
      <div className="game-header__center">
        <span className="timer">{formatTime(elapsedSeconds)}</span>
      </div>
      <div className="game-header__right">
        <select
          className="difficulty-select"
          value={difficulty}
          onChange={e => onNewGame(e.target.value as Difficulty)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button className="new-game-btn" onClick={() => onNewGame(difficulty)}>
          New Game
        </button>
      </div>
    </header>
  );
}
