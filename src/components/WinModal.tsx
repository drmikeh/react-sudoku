import type { Difficulty } from '../types';

type Props = {
  elapsedSeconds: number;
  hintsUsed: number;
  difficulty: Difficulty;
  onNewGame: (difficulty: Difficulty) => void;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function WinModal({ elapsedSeconds, hintsUsed, difficulty, onNewGame }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal__title">Puzzle Solved!</h2>
        <div className="modal__stats">
          <div className="modal__stat">
            <span className="modal__stat-label">Time</span>
            <span className="modal__stat-value">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="modal__stat">
            <span className="modal__stat-label">Hints Used</span>
            <span className="modal__stat-value">{hintsUsed}</span>
          </div>
          <div className="modal__stat">
            <span className="modal__stat-label">Difficulty</span>
            <span className="modal__stat-value">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
        </div>
        <div className="modal__actions">
          <button onClick={() => onNewGame(difficulty)}>Play Again</button>
          <button onClick={() => onNewGame('easy')}>Easy</button>
          <button onClick={() => onNewGame('medium')}>Medium</button>
          <button onClick={() => onNewGame('hard')}>Hard</button>
        </div>
      </div>
    </div>
  );
}
