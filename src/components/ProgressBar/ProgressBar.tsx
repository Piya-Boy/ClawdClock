interface Props {
  pct: number;
  color: string;
}

export function ProgressBar({ pct, color }: Props) {
  return (
    <div style={{
      width: '100%', height: 7,
      background: '#1d1d1d',
      borderRadius: 4, overflow: 'hidden',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: color, borderRadius: 4,
      }} />
    </div>
  );
}
