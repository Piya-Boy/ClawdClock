import { FlipDigit } from './FlipDigit';

interface Props {
  hours: number;
  minutes: number;
}

export function FlipClock({ hours, minutes }: Props) {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <FlipDigit value={h[0]} />
        <FlipDigit value={h[1]} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <FlipDigit value={m[0]} />
        <FlipDigit value={m[1]} />
      </div>
    </div>
  );
}
