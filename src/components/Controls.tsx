type Props = {
  pencilMode: boolean;
  onDigit: (digit: number) => void;
  onErase: () => void;
  onTogglePencil: () => void;
};

export default function Controls({ pencilMode, onDigit, onErase, onTogglePencil }: Props) {
  return (
    <div className="controls">
      <div className="controls__digits">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} className="controls__digit" onClick={() => onDigit(n)}>
            {n}
          </button>
        ))}
      </div>
      <div className="controls__actions">
        <button className="controls__erase" onClick={onErase}>Erase</button>
        <button
          className={`controls__pencil${pencilMode ? ' controls__pencil--active' : ''}`}
          onClick={onTogglePencil}
        >
          Pencil {pencilMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}
