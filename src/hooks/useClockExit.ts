import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '../stores/settingsStore';

const MOUSE_THRESHOLD_PX = 10;
const DEBOUNCE_MS = 300;

export function useClockExit(onRequestUnlock?: () => void) {
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const lastFired = useRef(0);
  const { lockScreenEnabled, lockPassword } = useSettingsStore();

  useEffect(() => {
    const dismiss = () => {
      const now = Date.now();
      if (now - lastFired.current < DEBOUNCE_MS) return;
      lastFired.current = now;

      if (lockScreenEnabled) {
        if (lockPassword && onRequestUnlock) {
          onRequestUnlock();
        }
        // no password set + locked = block exit entirely
        return;
      }
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
  }, [lockScreenEnabled, lockPassword, onRequestUnlock]);
}
