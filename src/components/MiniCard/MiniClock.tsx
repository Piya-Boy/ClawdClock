import { MiniCard } from './MiniCard';
import type { Theme } from '../../themes';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  hours: number;
  minutes: number;
  is12: boolean;
  ampm: string;
  theme: Theme;
}

export function MiniClock({ hours, minutes, is12, ampm, theme }: Props) {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 5 }}>
        <MiniCard digit={h[0]} theme={theme} /><MiniCard digit={h[1]} theme={theme} />
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <MiniCard digit={m[0]} theme={theme} /><MiniCard digit={m[1]} theme={theme} />
      </div>
      {is12 && (
        <div style={{ fontSize: 9, fontWeight: 700, color: theme.labelColor, fontFamily: FF, letterSpacing: '0.14em', marginTop: 1 }}>
          {ampm}
        </div>
      )}
    </div>
  );
}
