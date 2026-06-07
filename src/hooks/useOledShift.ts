import { useState, useEffect } from 'react';

const SHIFT_INTERVAL_MS = 30_000;
const MAX_SHIFT = 4;

export function useOledShift(enabled: boolean): { x: number; y: number } {
  const [shift, setShift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      setShift({ x: 0, y: 0 });
      return;
    }

    const tick = () => {
      const x = Math.round((Math.random() * 2 - 1) * MAX_SHIFT);
      const y = Math.round((Math.random() * 2 - 1) * MAX_SHIFT);
      setShift({ x, y });
    };

    tick();
    const id = setInterval(tick, SHIFT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled]);

  return shift;
}
