import { useRef, useEffect } from 'react';

const MASCOT_SIZE = 160;
const SPEED = 1.8;

export function useBouncingMascot() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 80, y: 20 });
  const vel = useRef({ x: SPEED, y: SPEED * 0.7 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const el = ref.current;
      if (!el) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const p = pos.current;
      const v = vel.current;

      p.x += v.x;
      p.y += v.y;

      if (p.x <= 0)               { p.x = 0;                v.x =  Math.abs(v.x); }
      if (p.x >= W - MASCOT_SIZE) { p.x = W - MASCOT_SIZE; v.x = -Math.abs(v.x); }
      if (p.y <= 0)               { p.y = 0;                v.y =  Math.abs(v.y); }
      if (p.y >= H - MASCOT_SIZE) { p.y = H - MASCOT_SIZE; v.y = -Math.abs(v.y); }

      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return { ref, size: MASCOT_SIZE };
}
