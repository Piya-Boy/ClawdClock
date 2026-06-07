import { FlipClock } from './components/FlipClock/FlipClock';
import { BouncingMascot } from './components/ClawdMascot/BouncingMascot';
import { UsageSection } from './components/UsagePanel/UsageSection';
import { useClock } from './hooks/useClock';
import { useScale } from './hooks/useScale';
import { useClaudeUsage } from './hooks/useClaudeUsage';
import { useClockExit } from './hooks/useClockExit';
import { useUsageStore } from './stores/usageStore';
import { formatTimeAgo } from './utils/countdown';
import './styles/globals.css';

const C_ORANGE   = '#FF6B3D';
const C_GREEN    = '#66CC44';
const C_YELLOW   = '#FFB800';
const C_RED      = '#FF4444';
const FF         = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

function usageColor(pct: number): string {
  if (pct >= 90) return C_RED;
  if (pct >= 70) return C_YELLOW;
  return C_GREEN;
}

export function App() {
  const now   = useClock();
  const scale = useScale(1920, 1080);

  useClaudeUsage();
  useClockExit();

  const {
    sessionPct, weeklyPct,
    sessionCountdown, weeklyCountdown,
    error, lastUpdated,
  } = useUsageStore();

  const sessionColor = usageColor(sessionPct);
  const weeklyColor  = usageColor(weeklyPct);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <BouncingMascot />

      {/* fixed 1920×1080 canvas, scales to viewport */}
      <div style={{
        width: 1920, height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        background: '#000000',
        display: 'flex',
        flexShrink: 0,
      }}>

        {/* LEFT 40% — Flip Clock */}
        <div style={{
          width: '40%', height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FlipClock hours={now.getHours()} minutes={now.getMinutes()} />
        </div>

        {/* RIGHT 60% — Dashboard */}
        <div style={{
          flex: 1, height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: 112,
          paddingRight: 140,
          paddingTop: 80,
          paddingBottom: 80,
        }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 92,
          }}>
            <div style={{
              fontSize: 62, fontWeight: 900, lineHeight: 1,
              color: C_ORANGE,
              fontFamily: FF,
              letterSpacing: '0.055em',
              whiteSpace: 'nowrap',
            }}>
              CLAUDE CODE
            </div>

            {/* Last updated / error indicator */}
            {(lastUpdated || error) && (
              <div style={{
                fontSize: 22, fontWeight: 600,
                color: error ? '#FF4444' : '#2a2a2a',
                fontFamily: FF,
                letterSpacing: '0.08em',
                alignSelf: 'flex-end',
                marginBottom: 4,
              }}>
                {error ? 'OFFLINE' : lastUpdated ? `UPDATED ${formatTimeAgo(lastUpdated).toUpperCase()}` : ''}
              </div>
            )}
          </div>

          <UsageSection
            label="SESSION (5H)"
            pct={sessionPct}
            color={sessionColor}
            resetIn={sessionCountdown}
          />

          <div style={{
            height: 1,
            background: '#1c1c1c',
            margin: '70px 0',
          }} />

          <UsageSection
            label="WEEKLY (7D)"
            pct={weeklyPct}
            color={weeklyColor}
            resetIn={weeklyCountdown}
          />

        </div>
      </div>
    </div>
  );
}

export default App;
