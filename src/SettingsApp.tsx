import { useState, useEffect } from 'react';
import mascotGif from './assets/mascot.gif';
import { TitleBar } from './components/Settings/TitleBar';
import { SettingRow } from './components/Settings/SettingRow';
import { Dropdown } from './components/Settings/Dropdown';
import { SegControl } from './components/Settings/SegControl';
import { Toggle } from './components/Settings/Toggle';
import { ClawdClockView } from './components/ClawdClockView/ClawdClockView';
import { useClock } from './hooks/useClock';
import { useSettingsStore } from './stores/settingsStore';
import { useIdleDetection } from './hooks/useIdleDetection';
import { useMonitors } from './hooks/useMonitors';
import { useUpdater } from './hooks/useUpdater';
import { useUsageStore } from './stores/usageStore';
import { useClaudeUsage } from './hooks/useClaudeUsage';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';
import { THEMES, THEME_ORDER, getTheme } from './themes';
import type { ThemeId } from './themes';
import './styles/globals.css';
import './styles/settings.css';

const WIN_W  = 900;
const WIN_H  = 580;
const FOOT_H = 56;
const LEFT_W = 352;
const PREVIEW_W = WIN_W - LEFT_W;
const PREVIEW_H = WIN_H - FOOT_H - 32; // minus TitleBar
const PREVIEW_SCALE = Math.min(PREVIEW_W / 1920, PREVIEW_H / 1080);
const C_ACC  = '#FF6B3D';
const FF     = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

export function SettingsApp() {
  const now = useClock();
  useIdleDetection();
  useClaudeUsage();

  const [appVersion, setAppVersion] = useState('');
  useEffect(() => { getVersion().then(setAppVersion).catch(() => {}); }, []);

  const {
    activateAfter, sleepAfter, timeFormat,
    theme: themeId, oledMode, lockPassword,
    launchAtStartup, selectedMonitor, lockScreenEnabled, autoUpdate,
    setActivateAfter, setSleepAfter, setTimeFormat,
    setTheme, setOledMode, setLockPassword,
    setLaunchAtStartup, setSelectedMonitor, setLockScreenEnabled, setAutoUpdate,
  } = useSettingsStore();

  const {
    sessionPct, weeklyPct,
    sessionCountdown, weeklyCountdown,
    error, lastUpdated,
  } = useUsageStore();

  const theme = getTheme(themeId);
  const monitors = useMonitors();
  const updater = useUpdater();

  const sessionColor = sessionPct >= 90 ? theme.critical : sessionPct >= 70 ? theme.warning : theme.healthy;
  const weeklyColor  = weeklyPct  >= 90 ? theme.critical : weeklyPct  >= 70 ? theme.warning : theme.healthy;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0d0d0d',
      display: 'flex', flexDirection: 'column',
      width: WIN_W, height: WIN_H,
      overflow: 'hidden',
    }}>
      <TitleBar />

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Settings column */}
        <div style={{
          width: LEFT_W, minWidth: LEFT_W,
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          padding: '28px 32px 24px',
        }}>
          {/* App header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <img src={mascotGif} width={40} height={40}
                 style={{ imageRendering: 'pixelated', display: 'block', borderRadius: 6 }} alt="mascot" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#e0e0e0', fontFamily: FF, lineHeight: 1 }}>ClawdClock</div>
              <div style={{ fontSize: 11, color: '#363636', fontFamily: FF, marginTop: 5, fontWeight: 500, letterSpacing: '0.01em' }}>
                Screen Saver & Idle Display
              </div>
            </div>
          </div>

          <SettingRow
            label="Activate After"
            desc="Show when the computer has been idle."
            control={
              <Dropdown
                value={activateAfter}
                options={['1 minute', '5 minutes', '10 minutes', '15 minutes', '30 minutes']}
                onChange={v => setActivateAfter(v as any)}
              />
            }
          />
          <SettingRow
            label="Computer Sleep"
            desc="Sleep while ClawdClock is active."
            control={
              <Dropdown
                value={sleepAfter}
                options={['Never', '15 minutes', '30 minutes', '1 hour', '2 hours']}
                onChange={v => setSleepAfter(v as any)}
              />
            }
          />
          <SettingRow
            label="Time Format"
            control={
              <SegControl
                value={timeFormat}
                options={[{ val: '24', label: '24 Hour' }, { val: '12', label: '12 Hour' }]}
                onChange={v => setTimeFormat(v as any)}
              />
            }
          />
          <SettingRow
            label="Theme"
            desc="Visual style for the clock display."
            control={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 172 }}>
                {THEME_ORDER.map(id => {
                  const t = THEMES[id];
                  const active = id === themeId;
                  return (
                    <button
                      key={id}
                      onClick={() => setTheme(id as ThemeId)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 10px',
                        background: active ? 'rgba(255,107,61,0.12)' : 'transparent',
                        border: `1px solid ${active ? 'rgba(255,107,61,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 6, cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div style={{
                        width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                        background: t.headerColor,
                        boxShadow: `0 0 0 1px rgba(0,0,0,0.4)`,
                      }} />
                      <span style={{
                        fontSize: 11, fontWeight: active ? 700 : 500,
                        color: active ? '#e0e0e0' : '#555',
                        fontFamily: FF, letterSpacing: '0.01em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            }
          />
          <SettingRow
            label="OLED Mode"
            desc="Slowly shift pixels to prevent burn-in on OLED displays."
            control={<Toggle value={oledMode} onChange={setOledMode} />}
          />
          <SettingRow
            label="Launch at Startup"
            desc="Start ClawdClock automatically when you log in."
            control={<Toggle value={launchAtStartup} onChange={setLaunchAtStartup} />}
          />
          {monitors.length > 1 && (
            <SettingRow
              label="Display"
              desc="Monitor to show ClawdClock on."
              control={
                <Dropdown
                  value={
                    selectedMonitor === -1
                      ? 'All Monitors'
                      : monitors[selectedMonitor]
                        ? `${monitors[selectedMonitor].name}${monitors[selectedMonitor].is_primary ? ' (Primary)' : ''}`
                        : 'Primary'
                  }
                  options={[
                    ...monitors.map(m => `${m.name}${m.is_primary ? ' (Primary)' : ''}`),
                    'All Monitors',
                  ]}
                  onChange={v => {
                    if (v === 'All Monitors') { setSelectedMonitor(-1); return; }
                    const idx = monitors.findIndex(m => `${m.name}${m.is_primary ? ' (Primary)' : ''}` === v);
                    if (idx >= 0) setSelectedMonitor(idx);
                  }}
                />
              }
            />
          )}

          <SettingRow
            label="Lock Screen Mode"
            desc="Block mouse and keyboard while ClawdClock is active."
            control={
              <Toggle
                value={lockScreenEnabled}
                onChange={v => {
                  setLockScreenEnabled(v);
                  invoke('set_lock_screen', { locked: v }).catch(() => {});
                }}
              />
            }
          />
          {lockScreenEnabled && (
            <SettingRow
              label="Lock Password"
              desc="Required to exit lock screen. Leave empty to disable."
              control={
                <input
                  type="password"
                  value={lockPassword}
                  onChange={e => setLockPassword(e.target.value)}
                  placeholder="Set password…"
                  autoComplete="new-password"
                  style={{
                    width: 160, padding: '7px 10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6, outline: 'none',
                    color: '#ccc', fontFamily: FF, fontSize: 13,
                    letterSpacing: '0.08em',
                  }}
                />
              }
            />
          )}

          <SettingRow
            label="Auto Update"
            desc="Check for updates automatically on startup."
            control={<Toggle value={autoUpdate} onChange={setAutoUpdate} />}
          />

          {/* Preview Now */}
          <button
            className="preview-btn"
            onClick={() => {
              if (selectedMonitor === -1) {
                invoke('show_clock_on_all_monitors').catch(() => {});
              } else {
                invoke('show_clock_on_monitor', { monitorId: selectedMonitor }).catch(() => {});
              }
            }}
            style={{
              marginTop: 20,
              width: '100%', padding: '10px 0',
              background: 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              transition: 'opacity 0.15s ease', textAlign: 'left',
            }}
          >
            <svg width="9" height="11" viewBox="0 0 9 11" fill="none" style={{ flexShrink: 0, marginLeft: 2 }}>
              <path d="M1 1L8 5.5L1 10V1Z" fill={C_ACC}/>
            </svg>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#666', fontFamily: FF, lineHeight: 1 }}>
              Preview Now
            </div>
          </button>
        </div>

        {/* RIGHT: Live preview — exact ClawdClockView scaled down */}
        <div style={{
          flex: 1,
          background: theme.bg,
          display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          transition: 'background 0.2s ease',
        }}>
          <div style={{
            transform: `scale(${PREVIEW_SCALE})`,
            transformOrigin: 'center center',
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
      </div>

      {/* Footer */}
      <div style={{
        height: FOOT_H, minHeight: FOOT_H,
        background: '#0d0d0d',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', gap: 8,
      }}>
        <div style={{ fontSize: 11, color: '#2a2a2a', fontFamily: FF, letterSpacing: '0.02em' }}>
          ClawdClock {appVersion ? `v${appVersion}` : ''}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {updater.error && (
            <span style={{ fontSize: 11, color: '#555', fontFamily: FF }}>Update check failed</span>
          )}
          {updater.checking && (
            <span style={{ fontSize: 11, color: '#444', fontFamily: FF }}>Checking for updates…</span>
          )}
          {!updater.checking && !updater.available && !updater.error && updater.lastChecked && (
            <span style={{ fontSize: 11, color: '#2a2a2a', fontFamily: FF }}>Up to date</span>
          )}
          {updater.available && !updater.installing && (
            <>
              <span style={{ fontSize: 11, color: C_ACC, fontFamily: FF, fontWeight: 600 }}>
                v{updater.version} available
              </span>
              <button
                onClick={updater.install}
                style={{
                  padding: '6px 16px',
                  background: C_ACC, border: 'none', borderRadius: 5,
                  color: '#fff', fontFamily: FF, fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.02em',
                }}
              >
                Update &amp; Restart
              </button>
            </>
          )}
          {updater.installing && (
            <span style={{ fontSize: 11, color: C_ACC, fontFamily: FF, fontWeight: 600 }}>Installing…</span>
          )}
          {!updater.checking && (
            <button
              onClick={updater.check}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5,
                color: '#484848', fontFamily: FF, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', letterSpacing: '0.02em',
              }}
            >
              Check
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsApp;
