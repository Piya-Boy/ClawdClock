import { ClawdClockView } from './components/ClawdClockView/ClawdClockView';
import { EscapeBar } from './components/EscapeBar/EscapeBar';
import { useClock } from './hooks/useClock';
import { useScale } from './hooks/useScale';
import { useClaudeUsage } from './hooks/useClaudeUsage';
import { useClockExit } from './hooks/useClockExit';
import { useKeepAwake } from './hooks/useKeepAwake';
import { useUsageStore } from './stores/usageStore';
import { useSettingsStore } from './stores/settingsStore';
import { getTheme } from './themes';
import { useOledShift } from './hooks/useOledShift';
import { invoke } from '@tauri-apps/api/core';
import './styles/globals.css';

export function App() {
  const now   = useClock();
  const scale = useScale(1920, 1080);
  useClaudeUsage();
  useKeepAwake();

  const { lockScreenEnabled, theme: themeId, oledMode, timeFormat, dateFormat, dateEra } = useSettingsStore();
  const oledShift = useOledShift(oledMode);
  const theme = getTheme(themeId);

  const handleDismiss = () => {
    if (lockScreenEnabled) return;
    invoke('hide_clock_window').catch(() => {});
  };

  useClockExit(handleDismiss);

  const {
    sessionPct, weeklyPct,
    sessionCountdown, weeklyCountdown,
    sessionResetAt, weeklyResetAt,
    error,
  } = useUsageStore();

  // Surface the error badge only when we have nothing real to show. If a
  // previous fetch succeeded, we still hold valid numbers (a transient 429 or
  // network blip shouldn't slap an OFFLINE badge over good data) — keep showing
  // them silently until the next successful refresh.
  const haveData = !!sessionResetAt || !!weeklyResetAt;
  const clockError = haveData ? null : error;

  const sessionColor = sessionPct >= 90 ? theme.critical : sessionPct >= 70 ? theme.warning : theme.healthy;
  const weeklyColor  = weeklyPct  >= 90 ? theme.critical : weeklyPct  >= 70 ? theme.warning : theme.accent;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <EscapeBar />

<div style={{
        transform: `scale(${scale}) translate(${oledShift.x}px, ${oledShift.y}px)`,
        transformOrigin: 'center center',
        transition: oledMode ? 'transform 2s ease' : undefined,
        flexShrink: 0,
      }}>
        <ClawdClockView
          hours={now.getHours()}
          minutes={now.getMinutes()}
          timeFormat={timeFormat}
          theme={theme}
          sessionPct={sessionPct}
          weeklyPct={weeklyPct}
          sessionCountdown={sessionCountdown}
          weeklyCountdown={weeklyCountdown}
          sessionColor={sessionColor}
          weeklyColor={weeklyColor}
          error={clockError}
          now={now}
          dateFormat={dateFormat}
          dateEra={dateEra}
        />
      </div>
    </div>
  );
}

export default App;
