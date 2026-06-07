import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

const SHOW_ZONE_PX = 80; // mouse within top 80px = show button

// EscapeBar = explicit exit affordance. Always works, even with lock screen on —
// lock screen only blocks accidental dismiss (mouse move / key press), not this button.
export function EscapeBar() {
  const [visible, setVisible] = useState(false);

  const handleExit = () => {
    invoke('hide_clock_window').catch(() => {});
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const next = e.clientY <= SHOW_ZONE_PX;
      setVisible(prev => (prev === next ? prev : next));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'F11') {
        e.preventDefault();
        handleExit();
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      data-escape-bar="true"
      style={{
        position: 'fixed',
        top: 14,
        left: '50%',
        transform: visible
          ? 'translateX(-50%) translateY(0) scale(1)'
          : 'translateX(-50%) translateY(-70px) scale(0.8)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease',
        zIndex: 1001,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <button
        title="Exit (Esc)"
        onClick={handleExit}
        style={{
          width: 44, height: 44,
          borderRadius: '50%',
          background: 'rgba(10,10,10,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
          outline: 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(210,40,40,0.9)';
          e.currentTarget.style.borderColor = 'rgba(255,80,80,0.6)';
          e.currentTarget.style.transform = 'scale(1.12)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(10,10,10,0.8)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
