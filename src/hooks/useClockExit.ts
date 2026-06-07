import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

const MOUSE_THRESHOLD_PX = 8;
const DEBOUNCE_MS = 150;
const IS_DEV = import.meta.env.DEV;

// In production: any interaction hides the clock immediately — no confirmation, no password.
// In dev: EscapeBar handles ESC/F11/Ctrl+, so skip those keys to avoid double-fire.
export function useClockExit() {
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const lastFired = useRef(0);

  useEffect(() => {
    const dismiss = () => {
      const now = Date.now();
      if (now - lastFired.current < DEBOUNCE_MS) return;
      lastFired.current = now;
      invoke('hide_clock_window').catch(() => {});
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!startPos.current) {
        startPos.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > MOUSE_THRESHOLD_PX || dy > MOUSE_THRESHOLD_PX) dismiss();
    };

    const onMouseDown = () => dismiss();

    const onKeyDown = (e: KeyboardEvent) => {
      if (IS_DEV) {
        // Let EscapeBar handle these in dev
        if (e.key === 'Escape' || e.key === 'F11') return;
        if ((e.ctrlKey || e.metaKey) && e.key === ',') return;
      }
      dismiss();
    };

    const onTouchStart = () => dismiss();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
    };
  }, []);
}
