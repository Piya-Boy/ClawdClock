import type { Theme } from '../../themes';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const MC_W = 54, MC_H = 66, MC_HH = 33, MC_FS = 58;

interface Props {
  digit: string;
  theme: Theme;
}

export function MiniCard({ digit, theme }: Props) {
  const baseNum: React.CSSProperties = {
    position: 'absolute', left: 0, width: MC_W, height: MC_H,
    fontSize: MC_FS, lineHeight: `${MC_H}px`,
    fontFamily: FF, fontWeight: 900, textAlign: 'center', letterSpacing: '-0.01em',
  };
  return (
    <div style={{ position: 'relative', width: MC_W, height: MC_H, flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: MC_W, height: MC_HH,
        overflow: 'hidden', background: theme.cardTop, borderRadius: '5px 5px 0 0' }}>
        <div style={{ ...baseNum, top: 0, color: theme.digitColor }}>{digit}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: MC_W, height: MC_HH,
        overflow: 'hidden', background: theme.cardBot, borderRadius: '0 0 5px 5px' }}>
        <div style={{ ...baseNum, top: -MC_HH, color: theme.digitColorBot }}>{digit}</div>
      </div>
      <div style={{ position: 'absolute', top: MC_HH - 1, left: 0, width: '100%', height: 2, background: theme.fold, zIndex: 5 }} />
      {[[-3, MC_HH - 4], [MC_W - 2, MC_HH - 4]].map(([l, t], i) => (
        <div key={i} style={{ position: 'absolute', top: t, left: l, width: 5, height: 8, borderRadius: 1, background: theme.fold, zIndex: 6 }} />
      ))}
    </div>
  );
}
