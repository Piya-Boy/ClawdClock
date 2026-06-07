import { ProgressBar } from '../ProgressBar/ProgressBar';
import type { Theme } from '../../themes';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  label: string;
  pct: number;
  color: string;
  resetIn: string;
  resetLabel?: string;
  theme: Theme;
}

export function UsageSection({ label, pct, color, resetIn, resetLabel = 'RESETS IN', theme }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        fontSize: 14, fontWeight: 700,
        letterSpacing: '0.18em',
        color: theme.labelColor,
        fontFamily: FF,
      }}>
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, lineHeight: 1 }}>
        <span style={{
          fontSize: 114, fontWeight: 900,
          color, fontFamily: FF,
          letterSpacing: '-0.04em', lineHeight: 1,
        }}>
          {pct}
        </span>
        <span style={{
          fontSize: 52, fontWeight: 700,
          color, fontFamily: FF,
          opacity: 0.6, letterSpacing: '-0.02em',
        }}>
          %
        </span>
      </div>

      <ProgressBar pct={pct} color={color} />

      <div style={{
        fontSize: 13, fontWeight: 600,
        letterSpacing: '0.15em',
        color: theme.resetColor,
        fontFamily: FF,
      }}>
        {resetLabel} {resetIn}
      </div>
    </div>
  );
}
