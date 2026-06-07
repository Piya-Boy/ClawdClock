import type { CIStatus } from '../../hooks/useCIStatus';
import type { Theme } from '../../themes';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  ci: CIStatus;
  theme: Theme;
}

function statusColor(status: CIStatus['status'], theme: Theme): string {
  switch (status) {
    case 'success':     return theme.healthy;
    case 'failure':     return theme.critical;
    case 'in_progress': return theme.warning;
    case 'queued':      return theme.warning;
    default:            return theme.labelColor;
  }
}

function statusLabel(status: CIStatus['status']): string {
  switch (status) {
    case 'success':     return 'PASSING';
    case 'failure':     return 'FAILING';
    case 'in_progress': return 'RUNNING';
    case 'queued':      return 'QUEUED';
    default:            return 'UNKNOWN';
  }
}

export function CIStatusBadge({ ci, theme }: Props) {
  if (ci.status === 'unknown') return null;

  const color = statusColor(ci.status, theme);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontSize: 14, fontWeight: 700,
        letterSpacing: '0.18em',
        color: theme.labelColor,
        fontFamily: FF,
      }}>
        CI / CD
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          background: color,
          boxShadow: `0 0 10px ${color}`,
          animation: ci.status === 'in_progress' ? 'pulse 1.2s ease-in-out infinite' : 'none',
        }} />
        <div style={{
          fontSize: 28, fontWeight: 800,
          color,
          fontFamily: FF, letterSpacing: '0.04em',
          transition: 'color 0.5s ease',
        }}>
          {statusLabel(ci.status)}
        </div>
      </div>
    </div>
  );
}
