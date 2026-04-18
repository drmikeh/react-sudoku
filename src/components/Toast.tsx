type Props = {
  message: string;
  visible: boolean;
};

export default function Toast({ message, visible }: Props) {
  return (
    <div className={`toast${visible ? ' toast--visible' : ''}`}>
      {message}
    </div>
  );
}
