import { FlipClock } from './components/FlipClock/FlipClock';
import { BouncingMascot } from './components/ClawdMascot/BouncingMascot';
import { UsageSection } from './components/UsagePanel/UsageSection';
import { useClock } from './hooks/useClock';
import { useScale } from './hooks/useScale';
import { useClaudeUsage } from './hooks/useClaudeUsage';
import { useClockExit } from './hooks/useClockExit';
import { useUsageStore } from './stores/usageStore';
import { useSettingsStore } from './stores/settingsStore';
import { formatTimeAgo } from './utils/countdown';
import { getTheme } from './themes';
import type { LayoutId } from './themes';
import './styles/globals.css';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface LayoutProps {
  layout: LayoutId;
  now: Date;
  theme: ReturnType<typeof getTheme>;
  sessionPct: number; weeklyPct: number;
  sessionColor: string; weeklyColor: string;
  sessionCountdown: string; weeklyCountdown: string;
  error: string | null; lastUpdated: Date | null;
  FF: string;
}

function DashPanel({ theme, sessionPct, weeklyPct, sessionColor, weeklyColor, sessionCountdown, weeklyCountdown, error, lastUpdated, FF, compact }: Omit<LayoutProps, 'layout' | 'now'> & { compact?: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      paddingLeft: compact ? 60 : 112,
      paddingRight: compact ? 60 : 140,
      paddingTop: compact ? 40 : 80,
      paddingBottom: compact ? 40 : 80,
      flex: 1, height: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: compact ? 48 : 92 }}>
        <div style={{ fontSize: compact ? 36 : 62, fontWeight: 900, lineHeight: 1, color: theme.headerColor, fontFamily: FF, letterSpacing: '0.055em', whiteSpace: 'nowrap' }}>
          CLAUDE CODE
        </div>
        {(lastUpdated || error) && (
          <div style={{ fontSize: compact ? 14 : 22, fontWeight: 600, color: error ? theme.critical : theme.offlineColor, fontFamily: FF, letterSpacing: '0.08em', alignSelf: 'flex-end', marginBottom: 4 }}>
            {error ? 'OFFLINE' : lastUpdated ? `UPDATED ${formatTimeAgo(lastUpdated).toUpperCase()}` : ''}
          </div>
        )}
      </div>
      <UsageSection label="SESSION (5H)" pct={sessionPct} color={sessionColor} resetIn={sessionCountdown} theme={theme} />
      <div style={{ height: 1, background: theme.divider, margin: `${compact ? 40 : 70}px 0` }} />
      <UsageSection label="WEEKLY (7D)" pct={weeklyPct} color={weeklyColor} resetIn={weeklyCountdown} theme={theme} />
    </div>
  );
}

function renderLayout(p: LayoutProps) {
  const clock = <FlipClock hours={p.now.getHours()} minutes={p.now.getMinutes()} theme={p.theme} />;

  if (p.layout === 'ultra') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FlipClock hours={p.now.getHours()} minutes={p.now.getMinutes()} theme={p.theme} />
      </div>
    );
  }

  if (p.layout === 'minimal') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60 }}>
        {clock}
        <div style={{ fontSize: 18, fontWeight: 700, color: p.theme.labelColor, fontFamily: p.FF, letterSpacing: '0.18em' }}>
          CLAUDE CODE
        </div>
      </div>
    );
  }

  if (p.layout === 'vertical') {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>{clock}</div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 80, paddingTop: 60 }}>
          <div style={{ width: 900, display: 'flex', flexDirection: 'column' }}>
            <DashPanel {...p} compact />
          </div>
        </div>
      </>
    );
  }

  if (p.layout === 'compact') {
    return (
      <>
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {clock}
        </div>
        <DashPanel {...p} compact />
      </>
    );
  }

  // horizontal (default)
  return (
    <>
      <div style={{ width: '40%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {clock}
      </div>
      <DashPanel {...p} />
    </>
  );
}

export function App() {
  const now   = useClock();
  const scale = useScale(1920, 1080);

  useClaudeUsage();
  useClockExit();

  const { lockScreenEnabled, theme: themeId, layout } = useSettingsStore();
  const theme = getTheme(themeId);

  const {
    sessionPct, weeklyPct,
    sessionCountdown, weeklyCountdown,
    error, lastUpdated,
  } = useUsageStore();

  const sessionColor = sessionPct >= 90 ? theme.critical : sessionPct >= 70 ? theme.warning : theme.healthy;
  const weeklyColor  = weeklyPct  >= 90 ? theme.critical : weeklyPct  >= 70 ? theme.warning : theme.healthy;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <BouncingMascot />

      {/* Lock indicator */}
      {lockScreenEnabled && (
        <div style={{
          position: 'fixed', bottom: 28, left: 32,
          zIndex: 998, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
            <rect x="2" y="7" width="10" height="8" rx="2" fill={theme.offlineColor}/>
            <path d="M4 7V5a3 3 0 016 0v2" stroke={theme.offlineColor} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontSize: 11, fontWeight: 600, color: theme.offlineColor,
            fontFamily: FF, letterSpacing: '0.12em',
          }}>
            LOCKED
          </span>
        </div>
      )}

      {/* fixed 1920×1080 canvas, scales to viewport */}
      <div style={{
        width: 1920, height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        background: theme.bg,
        display: 'flex',
        flexShrink: 0,
        alignItems: layout === 'vertical' ? 'center' : undefined,
        justifyContent: layout === 'minimal' || layout === 'ultra' || layout === 'vertical' ? 'center' : undefined,
        flexDirection: layout === 'vertical' ? 'column' : 'row',
      }}>
        {renderLayout({ layout, now, theme, sessionPct, weeklyPct, sessionColor, weeklyColor, sessionCountdown, weeklyCountdown, error, lastUpdated, FF })}
      </div>
    </div>
  );
}

export default App;
