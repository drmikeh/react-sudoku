type Props = {
  hintsUsed: number;
  onCheck: () => void;
  onHint: () => void;
};

export default function ActionBar({ hintsUsed, onCheck, onHint }: Props) {
  return (
    <div className="action-bar">
      <button className="action-bar__check" onClick={onCheck}>
        Check
      </button>
      <button className="action-bar__hint" onClick={onHint}>
        Hint{hintsUsed > 0 ? ` (${hintsUsed} used)` : ''}
      </button>
    </div>
  );
}
