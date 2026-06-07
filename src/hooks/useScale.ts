import { useState, useEffect } from 'react';

export function useScale(designW: number, designH: number): number {
  const [scale, setScale] = useState(() =>
    Math.min(window.innerWidth / designW, window.innerHeight / designH)
  );
  useEffect(() => {
    const fn = () => setScale(Math.min(window.innerWidth / designW, window.innerHeight / designH));
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [designW, designH]);
  return scale;
}
