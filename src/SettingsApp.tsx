import mascotGif from './assets/mascot.gif';
import { TitleBar } from './components/Settings/TitleBar';
import { SettingRow } from './components/Settings/SettingRow';
import { Dropdown } from './components/Settings/Dropdown';
import { SegControl } from './components/Settings/SegControl';
import { Toggle } from './components/Settings/Toggle';
import { MiniClock } from './components/MiniCard/MiniClock';
import { MiniMetric } from './components/UsagePanel/MiniMetric';
import { useClock } from './hooks/useClock';
import { useSettingsStore } from './stores/settingsStore';
import { useIdleDetection } from './hooks/useIdleDetection';
import { useMonitors } from './hooks/useMonitors';
import { invoke } from '@tauri-apps/api/core';
import { THEMES, THEME_ORDER, getTheme } from './themes';
import type { ThemeId } from './themes';
import './styles/globals.css';
import './styles/settings.css';

const WIN_W  = 900;
const WIN_H  = 580;
const FOOT_H = 56;
const LEFT_W = 352;
const C_ACC  = '#FF6B3D';
const FF     = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

export function SettingsApp() {
  const now = useClock();
  useIdleDetection();

  const { activateAfter, sleepAfter, timeFormat, theme: themeId, launchAtStartup, selectedMonitor, lockScreenEnabled, setActivateAfter, setSleepAfter, setTimeFormat, setTheme, setLaunchAtStartup, setSelectedMonitor, setLockScreenEnabled } = useSettingsStore();
  const previewTheme = getTheme(themeId);
  const monitors = useMonitors();

  const is12     = timeFormat === '12';
  const rawH     = now.getHours();
  const displayH = is12 ? (rawH % 12 || 12) : rawH;
  const ampm     = rawH >= 12 ? 'PM' : 'AM';
  const mins     = now.getMinutes();

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
                      {/* color swatch */}
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
                  value={monitors[selectedMonitor]
                    ? `${monitors[selectedMonitor].name}${monitors[selectedMonitor].is_primary ? ' (Primary)' : ''}`
                    : 'Primary'}
                  options={monitors.map(m => `${m.name}${m.is_primary ? ' (Primary)' : ''}`)}
                  onChange={v => {
                    const idx = monitors.findIndex(
                      m => `${m.name}${m.is_primary ? ' (Primary)' : ''}` === v
                    );
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

          {/* Preview Now — simple action row */}
          <button
            className="preview-btn"
            onClick={() => invoke('show_clock_on_monitor', { monitorId: selectedMonitor }).catch(() => {})}
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

        {/* RIGHT: Live preview — themed canvas */}
        <div style={{
          flex: 1,
          background: previewTheme.bg,
          display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          transition: 'background 0.2s ease',
        }}>
          {/* Mini dashboard */}
          <div style={{ display: 'flex', width: '86%', alignItems: 'center' }}>
            {/* Mini clock */}
            <div style={{ width: '38%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MiniClock hours={displayH} minutes={mins} is12={is12} ampm={ampm} theme={previewTheme} />
            </div>

            {/* Mini metrics */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 20 }}>
              <div style={{
                fontSize: 10, fontWeight: 900,
                color: previewTheme.headerColor, fontFamily: FF,
                letterSpacing: '0.05em', marginBottom: 16,
                whiteSpace: 'nowrap',
              }}>
                CLAUDE CODE
              </div>

              <MiniMetric label="SESSION (5H)" pct={37} color={previewTheme.healthy} theme={previewTheme} />
              <div style={{ height: 1, background: previewTheme.divider, margin: '12px 0' }} />
              <MiniMetric label="WEEKLY (7D)" pct={12} color={previewTheme.accent} theme={previewTheme} />
            </div>
          </div>

          {/* Mascot bottom-right */}
          <div style={{ position: 'absolute', bottom: 14, right: 16 }}>
            <img src={mascotGif} width={32} height={32}
                 style={{ imageRendering: 'pixelated', display: 'block', opacity: 0.5 }} alt="mascot" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        height: FOOT_H, minHeight: FOOT_H,
        background: '#0d0d0d',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 24px', gap: 8,
      }}>
        <button
          className="cancel-btn"
          style={{
            padding: '8px 22px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6,
            color: '#484848', fontFamily: FF, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '0.02em',
            transition: 'all 0.12s ease',
          }}
        >
          Cancel
        </button>
        <button
          className="save-btn"
          style={{
            padding: '8px 26px',
            background: C_ACC,
            border: 'none', borderRadius: 6,
            color: '#fff', fontFamily: FF, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.02em',
            transition: 'background 0.12s ease',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default SettingsApp;
