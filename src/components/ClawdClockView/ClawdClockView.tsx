import { FlipClock } from '../FlipClock/FlipClock';
import { UsageSection } from '../UsagePanel/UsageSection';
import type { Theme } from '../../themes';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  hours: number;
  minutes: number;
  theme: Theme;
  timeFormat: '24' | '12';
  sessionPct: number;
  weeklyPct: number;
  sessionCountdown: string;
  weeklyCountdown: string;
  sessionColor: string;
  weeklyColor: string;
  error: string | null;
}

export function ClawdClockView({
  hours, minutes, theme, timeFormat,
  sessionPct, weeklyPct,
  sessionCountdown, weeklyCountdown,
  sessionColor, weeklyColor,
  error,
}: Props) {
  const rawH = hours;
  const displayH = timeFormat === '12' ? (rawH % 12 || 12) : rawH;
  const ampm = timeFormat === '12' ? (rawH >= 12 ? 'PM' : 'AM') : undefined;
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
        <FlipClock hours={displayH} minutes={minutes} theme={theme} ampm={ampm} />
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
          {error && (
            <div style={{
              fontSize: 22, fontWeight: 600,
              color: theme.critical,
              fontFamily: FF, letterSpacing: '0.08em',
              alignSelf: 'flex-end', marginBottom: 4,
            }}>
              OFFLINE
            </div>
          )}
        </div>
        <UsageSection label="SESSION (5H)" pct={sessionPct} color={sessionColor} resetIn={sessionCountdown} theme={theme} />
        <div style={{ height: 1, background: theme.divider, margin: '70px 0' }} />
        <UsageSection label="WEEKLY (7D)" pct={weeklyPct} color={weeklyColor} resetIn={weeklyCountdown} resetLabel="RESETS" theme={theme} />
      </div>
    </div>
  );
}
