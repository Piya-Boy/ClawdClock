const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  label: string;
  pct: number;
  color: string;
}

export function MiniMetric({ label, pct, color }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.17em', color: '#333', fontFamily: FF }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
        <span style={{ fontSize: 32, fontWeight: 900, color, fontFamily: FF, letterSpacing: '-0.03em' }}>{pct}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color, fontFamily: FF, opacity: 0.6 }}>%</span>
      </div>
      <div style={{ height: 3, background: '#181818', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}
