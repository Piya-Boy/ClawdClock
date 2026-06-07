import { useRef, useEffect } from 'react';

const MASCOT_SIZE = 160;
const SPEED = 1.8;
const TOP_Y = 20;

export function useBouncingMascot() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 80 });
  const vel = useRef({ x: SPEED });
  const raf = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const el = ref.current;
      if (!el) return;
      const W = window.innerWidth;
      const p = pos.current;
      const v = vel.current;

      p.x += v.x;

      if (p.x <= 0)               { p.x = 0;                v.x =  Math.abs(v.x); }
      if (p.x >= W - MASCOT_SIZE) { p.x = W - MASCOT_SIZE; v.x = -Math.abs(v.x); }

      el.style.transform = `translate(${p.x}px, ${TOP_Y}px)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return { ref, size: MASCOT_SIZE };
}
