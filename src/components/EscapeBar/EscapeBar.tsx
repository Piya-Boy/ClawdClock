import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import mascotIcon from '../../assets/mascot.gif';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const BAR_H = 48;
const IS_DEV = import.meta.env.DEV;

interface Props {
  visible: boolean;
  now: Date;
  onKeepAlive: () => void;
  onHide: () => void;
  onRequestUnlock?: () => void;
  lockScreenEnabled: boolean;
  lockPassword: string;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function IconBtn({ label, title, onClick, children }: {
  label: string; title: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 12px',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6, cursor: 'pointer',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: FF, fontSize: 11, fontWeight: 600,
        letterSpacing: '0.04em',
        transition: 'background 0.12s, border-color 0.12s, color 0.12s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
        (e.currentTarget as HTMLButtonElement).style.color = '#fff';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
      }}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function EscapeBar({ visible, now, onKeepAlive, onHide, onRequestUnlock, lockScreenEnabled, lockPassword }: Props) {
  // Production: pure ambient mode — no controls, no overlays
  if (!IS_DEV) return null;

  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const timeStr = `${h}:${m}`;

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
      if (e.key === 'F11') {
        e.preventDefault();
        handleExit();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        handleSettings();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockScreenEnabled, lockPassword]);

  const handleExit = () => {
    if (lockScreenEnabled && lockPassword) {
      onRequestUnlock?.();
      return;
    }
    if (lockScreenEnabled) return;
    invoke('hide_clock_window').catch(() => {});
  };

  const handleSettings = () => {
    if (lockScreenEnabled) return;
    invoke('open_settings_window').catch(() => {});
  };

  const handleMinimize = () => {
    if (lockScreenEnabled) return;
    invoke('hide_clock_window').catch(() => {});
  };

  return (
    <>
      {/* invisible hover zone at top — always present */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 5, zIndex: 1000, pointerEvents: 'auto',
        }}
      />

      {/* the bar itself */}
      <div
        onMouseEnter={onKeepAlive}
        onMouseLeave={onHide}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: BAR_H,
          zIndex: 1001,
          pointerEvents: visible ? 'auto' : 'none',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease',
          background: 'rgba(10,10,10,0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          userSelect: 'none',
        }}
      >
        {/* LEFT: logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
          <img
            src={mascotIcon}
            width={22} height={22}
            style={{ imageRendering: 'pixelated', display: 'block' }}
            alt="ClawdClock"
          />
          <span style={{
            fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)',
            fontFamily: FF, letterSpacing: '0.06em',
          }}>
            CLAWDCLOCK
          </span>
        </div>

        {/* CENTER: current time */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{
            fontSize: 14, fontWeight: 700,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: FF, letterSpacing: '0.12em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {timeStr}
          </span>
        </div>

        {/* RIGHT: action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
          <IconBtn label="Settings" title="Open Settings (Ctrl+,)" onClick={handleSettings}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M6 1v1M6 10v1M1 6h1M10 6h1M2.5 2.5l.7.7M8.8 8.8l.7.7M2.5 9.5l.7-.7M8.8 3.2l.7-.7"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </IconBtn>

          <IconBtn label="Minimize" title="Minimize" onClick={handleMinimize}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </IconBtn>

          <button
            title="Exit Fullscreen (Esc)"
            onClick={handleExit}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 14px',
              background: 'rgba(255,60,60,0.15)',
              border: '1px solid rgba(255,60,60,0.3)',
              borderRadius: 6, cursor: 'pointer',
              color: 'rgba(255,120,120,0.9)',
              fontFamily: FF, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.04em',
              transition: 'background 0.12s, border-color 0.12s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.28)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,60,60,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.15)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,60,60,0.3)';
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span>Exit Fullscreen</span>
          </button>
        </div>
      </div>
    </>
  );
}
