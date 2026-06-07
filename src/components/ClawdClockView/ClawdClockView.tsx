import { FlipClock } from '../FlipClock/FlipClock';
import { UsageSection } from '../UsagePanel/UsageSection';
import { formatTimeAgo } from '../../utils/countdown';
import type { Theme } from '../../themes';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  hours: number;
  minutes: number;
  theme: Theme;
  sessionPct: number;
  weeklyPct: number;
  sessionCountdown: string;
  weeklyCountdown: string;
  sessionColor: string;
  weeklyColor: string;
  error: string | null;
  lastUpdated: Date | null;
}

export function ClawdClockView({
  hours, minutes, theme,
  sessionPct, weeklyPct,
  sessionCountdown, weeklyCountdown,
  sessionColor, weeklyColor,
  error, lastUpdated,
}: Props) {
  return (
    <div style={{
      width: 1920, height: 1080,
      background: theme.bg,
      display: 'flex',
      flexDirection: 'row',
      flexShrink: 0,
    }}>
      {/* Left: Clock 40% */}
      <div style={{
        width: '40%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <FlipClock hours={hours} minutes={minutes} theme={theme} />
      </div>

      {/* Right: Usage panel */}
      <div style={{
        flex: 1, height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingLeft: 112, paddingRight: 140, paddingTop: 80, paddingBottom: 80,
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: 92,
        }}>
          <div style={{
            fontSize: 62, fontWeight: 900, lineHeight: 1,
            color: theme.headerColor, fontFamily: FF,
            letterSpacing: '0.055em', whiteSpace: 'nowrap',
          }}>
            CLAUDE CODE
          </div>
          {(lastUpdated || error) && (
            <div style={{
              fontSize: 22, fontWeight: 600,
              color: error ? theme.critical : theme.offlineColor,
              fontFamily: FF, letterSpacing: '0.08em',
              alignSelf: 'flex-end', marginBottom: 4,
            }}>
              {error ? 'OFFLINE' : lastUpdated ? `UPDATED ${formatTimeAgo(lastUpdated).toUpperCase()}` : ''}
            </div>
          )}
        </div>
        <UsageSection label="SESSION (5H)" pct={sessionPct} color={sessionColor} resetIn={sessionCountdown} theme={theme} />
        <div style={{ height: 1, background: theme.divider, margin: '70px 0' }} />
        <UsageSection label="WEEKLY (7D)" pct={weeklyPct} color={weeklyColor} resetIn={weeklyCountdown} theme={theme} />
      </div>
    </div>
  );
}
