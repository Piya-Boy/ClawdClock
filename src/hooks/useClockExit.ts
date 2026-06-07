import { useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

const MOUSE_THRESHOLD_PX = 8;
const DEBOUNCE_MS = 150;
const GRACE_MS = 800;

export function useClockExit(onDismiss: () => void) {
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const lastFired = useRef(0);
  const shownAt = useRef(0);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const resetGrace = () => {
    shownAt.current = Date.now();
    startPos.current = null;
  };

  useEffect(() => {
    resetGrace();

    const win = getCurrentWindow();
    let unlisten: (() => void) | undefined;
    win.onFocusChanged(({ payload: focused }) => {
      if (focused) resetGrace();
    }).then(u => { unlisten = u; });

    const dismiss = () => {
      if (Date.now() - shownAt.current < GRACE_MS) return;
      const now = Date.now();
      if (now - lastFired.current < DEBOUNCE_MS) return;
      lastFired.current = now;
      onDismissRef.current();
    };

    const onMouseMove = (e: MouseEvent) => {
      if ((e.target as Element)?.closest('[data-escape-bar]')) return;
      if (Date.now() - shownAt.current < GRACE_MS) return;
      if (!startPos.current) {
        startPos.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > MOUSE_THRESHOLD_PX || dy > MOUSE_THRESHOLD_PX) dismiss();
    };

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as Element)?.closest('[data-escape-bar]')) return;
      dismiss();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'F11') return;
      if ((e.ctrlKey || e.metaKey) && e.key === ',') return;
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
      unlisten?.();
    };
  }, []);
}
