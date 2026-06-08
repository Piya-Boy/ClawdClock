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
  dataSource?: 'live' | 'cached';
}

export function ClawdClockView({
  hours, minutes, theme, timeFormat,
  sessionPct, weeklyPct,
  sessionCountdown, weeklyCountdown,
  sessionColor, weeklyColor,
  error, dataSource,
}: Props) {
  const rawH = hours;
  const displayH = timeFormat === '12' ? (rawH % 12 || 12) : rawH;
  const ampm = timeFormat === '12' ? (rawH >= 12 ? 'PM' : 'AM') : undefined;
  const notLoggedIn = !!error && /credentials not found|log in/i.test(error);
  // Stale cache: we have numbers but a live refresh failed. Distinct from a
  // hard offline/no-data state.
  const stale = !notLoggedIn && (dataSource === 'cached' || (!!error && !notLoggedIn));
  const badge = notLoggedIn ? 'NOT LOGGED IN' : stale ? 'CACHED' : 'OFFLINE';
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
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
              alignSelf: 'flex-end', marginBottom: 4,
            }}>
              <div style={{
                fontSize: 22, fontWeight: 600,
                color: stale ? theme.warning : theme.critical,
                fontFamily: FF, letterSpacing: '0.08em',
              }}>
                {badge}
              </div>
              {notLoggedIn && (
                <div style={{
                  fontSize: 16, fontWeight: 500,
                  color: theme.headerColor, opacity: 0.7,
                  fontFamily: FF, letterSpacing: '0.04em', marginTop: 6,
                }}>
                  run: claude auth login
                </div>
              )}
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
