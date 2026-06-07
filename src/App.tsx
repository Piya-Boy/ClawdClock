import { useState } from 'react';
import { ClawdClockView } from './components/ClawdClockView/ClawdClockView';
import { BouncingMascot } from './components/ClawdMascot/BouncingMascot';
import { EscapeBar } from './components/EscapeBar/EscapeBar';
import { PasswordPrompt } from './components/PasswordPrompt/PasswordPrompt';
import { useClock } from './hooks/useClock';
import { useScale } from './hooks/useScale';
import { useClaudeUsage } from './hooks/useClaudeUsage';
import { useClockExit } from './hooks/useClockExit';
import { useEscapeBar } from './hooks/useEscapeBar';
import { useUsageStore } from './stores/usageStore';
import { useSettingsStore } from './stores/settingsStore';
import { getTheme } from './themes';
import { useOledShift } from './hooks/useOledShift';
import { useOllamaStatus } from './hooks/useOllamaStatus';
import { useGitHubContributions } from './hooks/useGitHubContributions';
import { invoke } from '@tauri-apps/api/core';
import './styles/globals.css';

const IS_DEV = import.meta.env.DEV;

export function App() {
  const now   = useClock();
  const scale = useScale(1920, 1080);
  const [promptVisible, setPromptVisible] = useState(false);

  useClaudeUsage();

  const { lockScreenEnabled, lockPassword, theme: themeId, oledMode, timeFormat, githubUsername } = useSettingsStore();
  const oledShift = useOledShift(oledMode);
  const escapeBar = useEscapeBar();
  const ollama = useOllamaStatus();
  const github = useGitHubContributions(githubUsername || null);
  const theme = getTheme(themeId);

  const needsPassword = lockScreenEnabled && lockPassword.length > 0;

  const handleDismiss = () => {
    if (needsPassword) {
      setPromptVisible(true);
    } else {
      invoke('hide_clock_window').catch(() => {});
    }
  };

  useClockExit(handleDismiss);

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
          lockPassword={lockPassword}
        />
      )}

      {promptVisible && (
        <PasswordPrompt
          validate={input => input === lockPassword}
          onSuccess={() => {
            setPromptVisible(false);
            invoke('hide_clock_window').catch(() => {});
          }}
          onCancel={() => setPromptVisible(false)}
        />
      )}

      <BouncingMascot sessionPct={sessionPct} weeklyPct={weeklyPct} />

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
          error={error}
          lastUpdated={lastUpdated}
          ollamaAvailable={ollama.available}
          ollamaRunning={ollama.running}
          githubUsername={githubUsername}
          githubDays={github.days}
        />
      </div>
    </div>
  );
}

export default App;
