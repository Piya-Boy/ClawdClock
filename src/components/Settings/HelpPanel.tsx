import { useState } from 'react';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  onClose: () => void;
}

const SECTIONS = [
  {
    title: 'Getting Started',
    content: [
      { h: 'What is ClawdClock?', p: 'An ambient display that shows a flip clock and your Claude Code usage. It activates automatically when your computer is idle.' },
      { h: 'First Setup', p: '1. Set "Activate After" to your preferred idle timeout.\n2. Click "Preview Now" to test.\n3. Enable "Launch at Startup" to run on login.' },
      { h: 'Claude Code Usage', p: 'ClawdClock reads your Claude OAuth credentials from ~/.claude/.credentials.json automatically. No configuration needed.' },
    ],
  },
  {
    title: 'Screensaver',
    content: [
      { h: 'Windows Screensaver', p: 'Install the .scr file via the installer. ClawdClock appears in Screen Saver Settings (right-click desktop → Personalize → Lock screen → Screen saver).' },
      { h: 'Idle Timeout', p: 'Set "Activate After" in ClawdClock settings. This controls how long your computer must be idle before the clock appears.' },
      { h: 'Computer Sleep', p: '"Computer Sleep" controls whether Windows sleeps while ClawdClock is active. Set to "Never" to keep the screen on.' },
    ],
  },
  {
    title: 'Lock Screen',
    content: [
      { h: 'Enable Lock Screen', p: 'Toggle "Lock Screen Mode" in settings. While active, mouse movement and keyboard input are blocked — the clock stays on screen.' },
      { h: 'Exiting the clock', p: 'Move your mouse to the very top of the screen. A round X button slides down. Click it or press ESC to hide the clock.' },
    ],
  },
  {
    title: 'FAQ',
    content: [
      { h: 'Why does the clock not appear?', p: 'Check that "Activate After" is not set to "Never". Click "Preview Now" to test manually. Make sure no other fullscreen app is blocking it.' },
      { h: 'Usage shows 0% or is not updating', p: 'ClawdClock needs your Claude credentials at ~/.claude/.credentials.json. Log in to Claude Code (claude auth login) to generate this file.' },
      { h: 'How do I exit the clock?', p: 'Move your mouse to the top edge. A bar slides down — click Exit or press ESC. If Lock Screen Mode is on, only the escape bar works.' },
      { h: 'The settings window disappeared', p: 'ClawdClock lives in the system tray. Right-click the tray icon to reopen settings, or re-launch the app.' },
      { h: 'Clock flickers or shows black screen', p: 'Try disabling OLED Mode. On some systems, the window transparency causes flickering. Switching themes can also help.' },
      { h: 'How do I uninstall?', p: 'Use Windows Settings → Apps → ClawdClock → Uninstall. This removes the app and unregisters the screensaver.' },
      { h: 'Updates not working', p: 'Make sure "Auto Update" is enabled. You can also click "Check" in the footer. Updates require an internet connection and a signed release.' },
    ],
  },
];

export function HelpPanel({ onClose }: Props) {
  const [tab, setTab] = useState(0);
  const section = SECTIONS[tab];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 580, maxHeight: 460,
        background: '#111', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', fontFamily: FF, letterSpacing: '0.04em' }}>
            USER GUIDE
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#444', fontSize: 18, lineHeight: 1, padding: '0 2px', fontFamily: FF,
          }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 20px',
        }}>
          {SECTIONS.map((s, i) => (
            <button key={s.title} onClick={() => setTab(i)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 14px 9px',
              fontSize: 11, fontWeight: tab === i ? 700 : 500,
              color: tab === i ? '#e0e0e0' : '#444',
              fontFamily: FF, letterSpacing: '0.06em',
              borderBottom: `2px solid ${tab === i ? '#FF6B3D' : 'transparent'}`,
              marginBottom: -1,
              transition: 'color 0.1s',
            }}>
              {s.title.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {section.content.map(item => (
            <div key={item.h}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#c0c0c0',
                fontFamily: FF, marginBottom: 6,
              }}>
                {item.h}
              </div>
              <div style={{
                fontSize: 12, color: '#555', fontFamily: FF,
                lineHeight: 1.7, whiteSpace: 'pre-wrap',
              }}>
                {item.p}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
