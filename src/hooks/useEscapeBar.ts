import { useState, useEffect, useRef, useCallback } from 'react';

const EDGE_PX = 5;
const HIDE_DELAY_MS = 3000;
const IS_DEV = import.meta.env.DEV;

export function useEscapeBar() {
  const [visible, setVisible] = useState(IS_DEV);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!IS_DEV) setVisible(false);
    }, HIDE_DELAY_MS);
  }, []);

  const keepAlive = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!IS_DEV) setVisible(false);
    }, HIDE_DELAY_MS);
  }, []);

  const hide = useCallback(() => {
    if (IS_DEV) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (e.clientY <= EDGE_PX) {
        show();
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  return { visible, keepAlive, hide };
}
