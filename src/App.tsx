import { ClawdClockView } from './components/ClawdClockView/ClawdClockView';
import { BouncingMascot } from './components/ClawdMascot/BouncingMascot';
import { EscapeBar } from './components/EscapeBar/EscapeBar';
import { useClock } from './hooks/useClock';
import { useScale } from './hooks/useScale';
import { useClaudeUsage } from './hooks/useClaudeUsage';
import { useClockExit } from './hooks/useClockExit';
import { useEscapeBar } from './hooks/useEscapeBar';
import { useUsageStore } from './stores/usageStore';
import { useSettingsStore } from './stores/settingsStore';
import { getTheme } from './themes';
import { useOledShift } from './hooks/useOledShift';
import './styles/globals.css';

const IS_DEV = import.meta.env.DEV;

export function App() {
  const now   = useClock();
  const scale = useScale(1920, 1080);

  useClaudeUsage();
  useClockExit();

  const { lockScreenEnabled, theme: themeId, oledMode, timeFormat } = useSettingsStore();
  const oledShift = useOledShift(oledMode);
  const escapeBar = useEscapeBar();
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
      {IS_DEV && (
        <EscapeBar
          visible={escapeBar.visible}
          now={now}
          onKeepAlive={escapeBar.keepAlive}
          onHide={escapeBar.hide}
          lockScreenEnabled={lockScreenEnabled}
          lockPassword=""
        />
      )}

      <BouncingMascot />

      <div style={{
        transform: `scale(${scale}) translate(${oledShift.x}px, ${oledShift.y}px)`,
        transformOrigin: 'center center',
        transition: oledMode ? 'transform 2s ease' : undefined,
        flexShrink: 0,
      }}>
        <ClawdClockView
          hours={now.getHours()}
          minutes={now.getMinutes()}
          theme={theme}
          timeFormat={timeFormat}
          sessionPct={sessionPct}
          weeklyPct={weeklyPct}
          sessionCountdown={sessionCountdown}
          weeklyCountdown={weeklyCountdown}
          sessionColor={sessionColor}
          weeklyColor={weeklyColor}
          error={error}
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
}

export default App;
