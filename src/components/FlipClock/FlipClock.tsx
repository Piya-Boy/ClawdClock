import { FlipDigit } from './FlipDigit';
import type { Theme } from '../../themes';

interface Props {
  hours: number;
  minutes: number;
  theme: Theme;
}

export function FlipClock({ hours, minutes, theme }: Props) {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <FlipDigit value={h[0]} theme={theme} />
        <FlipDigit value={h[1]} theme={theme} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <FlipDigit value={m[0]} theme={theme} />
        <FlipDigit value={m[1]} theme={theme} />
      </div>
    </div>
  );
}
