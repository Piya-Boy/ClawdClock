import { useState, useEffect, useRef } from 'react';

/**
 * Ticks once per minute, aligned to the minute boundary.
 * The clock only displays HH:MM, so second-by-second updates waste CPU
 * (59 needless re-renders of the whole tree every minute).
 */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const scheduleNext = () => {
      const d = new Date();
      // ms remaining until the next minute boundary (+small guard)
      const msToNextMinute = (60 - d.getSeconds()) * 1000 - d.getMilliseconds() + 20;
      timeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        setNow(new Date());
        scheduleNext();
      }, msToNextMinute);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return now;
}
