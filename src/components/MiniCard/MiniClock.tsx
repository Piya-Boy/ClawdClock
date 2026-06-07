import { MiniCard } from './MiniCard';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  hours: number;
  minutes: number;
  is12: boolean;
  ampm: string;
}

export function MiniClock({ hours, minutes, is12, ampm }: Props) {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 5 }}>
        <MiniCard digit={h[0]} /><MiniCard digit={h[1]} />
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <MiniCard digit={m[0]} /><MiniCard digit={m[1]} />
      </div>
      {is12 && (
        <div style={{ fontSize: 9, fontWeight: 700, color: '#4a4a4a', fontFamily: FF, letterSpacing: '0.14em', marginTop: 1 }}>
          {ampm}
        </div>
      )}
    </div>
  );
}
