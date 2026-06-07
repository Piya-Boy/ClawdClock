const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const MC_W = 54, MC_H = 66, MC_HH = 33, MC_FS = 58;

interface Props {
  digit: string;
}

export function MiniCard({ digit }: Props) {
  const baseNum: React.CSSProperties = {
    position: 'absolute', left: 0, width: MC_W, height: MC_H,
    fontSize: MC_FS, lineHeight: `${MC_H}px`,
    fontFamily: FF, fontWeight: 900, textAlign: 'center', letterSpacing: '-0.01em',
  };
  return (
    <div style={{ position: 'relative', width: MC_W, height: MC_H, flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: MC_W, height: MC_HH,
        overflow: 'hidden', background: '#131313', borderRadius: '5px 5px 0 0' }}>
        <div style={{ ...baseNum, top: 0, color: '#fff' }}>{digit}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: MC_W, height: MC_HH,
        overflow: 'hidden', background: '#0b0b0b', borderRadius: '0 0 5px 5px' }}>
        <div style={{ ...baseNum, top: -MC_HH, color: '#999' }}>{digit}</div>
      </div>
      <div style={{ position: 'absolute', top: MC_HH - 1, left: 0, width: '100%', height: 2, background: '#000', zIndex: 5 }} />
      {[[-3, MC_HH - 4], [MC_W - 2, MC_HH - 4]].map(([l, t], i) => (
        <div key={i} style={{ position: 'absolute', top: t, left: l, width: 5, height: 8, borderRadius: 1, background: '#000', zIndex: 6 }} />
      ))}
    </div>
  );
}
