import { useRef, useEffect } from 'react';

const MASCOT_SIZE = 160;

export function useBouncingMascot(speed: number = 1.8) {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 80, y: 10 });
  const vel = useRef({ x: speed, y: speed * 0.7 });
  const raf = useRef<number>(0);
  const speedRef = useRef(speed);

  // Update speed reactively without resetting position
  useEffect(() => {
    const prev = speedRef.current;
    if (prev === speed) return;
    const ratio = speed / prev;
    vel.current.x *= ratio;
    vel.current.y *= ratio;
    // clamp direction sign preserved
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const tick = () => {
      const el = ref.current;
      if (!el) return;
      const W = window.innerWidth;
      const p = pos.current;
      const v = vel.current;

      const MAX_Y = MASCOT_SIZE; // stay in top strip

      p.x += v.x;
      p.y += v.y;

      if (p.x <= 0)               { p.x = 0;                v.x =  Math.abs(v.x); }
      if (p.x >= W - MASCOT_SIZE) { p.x = W - MASCOT_SIZE; v.x = -Math.abs(v.x); }
      if (p.y <= 0)               { p.y = 0;                v.y =  Math.abs(v.y); }
      if (p.y >= MAX_Y)           { p.y = MAX_Y;            v.y = -Math.abs(v.y); }

      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      raf.current = requestAnimationFrame(tick);
    };

    // Init velocity from current speed
    const s = speedRef.current;
    vel.current = { x: s, y: s * 0.7 };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return { ref, size: MASCOT_SIZE };
}
