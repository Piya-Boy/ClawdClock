import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

const MOUSE_THRESHOLD_PX = 10;
const DEBOUNCE_MS = 300;

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

    const onKeyDown = () => dismiss();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);
}
