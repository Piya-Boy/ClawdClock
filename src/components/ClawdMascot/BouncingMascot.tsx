import mascotGif from '../../assets/mascot.gif';
import { useBouncingMascot } from '../../hooks/useBouncingMascot';

const MASCOT_SIZE = 160;

interface Props {
  sessionPct: number;
  weeklyPct: number;
}

function getMascotFilter(sessionPct: number, weeklyPct: number): string {
  const maxPct = Math.max(sessionPct, weeklyPct);
  if (maxPct >= 90) {
    // critical — red glow, slight shake via hue-rotate
    return 'drop-shadow(0 0 18px rgba(255,60,60,0.9)) hue-rotate(330deg) saturate(2)';
  }
  if (maxPct >= 70) {
    // warning — orange glow
    return 'drop-shadow(0 0 14px rgba(255,180,0,0.8)) sepia(0.4) saturate(1.5)';
  }
  // healthy — subtle glow
  return 'drop-shadow(0 0 8px rgba(0,255,160,0.35))';
}

function getMascotAnimation(sessionPct: number, weeklyPct: number): string {
  const maxPct = Math.max(sessionPct, weeklyPct);
  if (maxPct >= 90) return 'mascotCritical 0.6s ease-in-out infinite';
  return 'mascotBob 2.4s ease-in-out infinite';
}

export function BouncingMascot({ sessionPct, weeklyPct }: Props) {
  const { ref } = useBouncingMascot();
  const filter = getMascotFilter(sessionPct, weeklyPct);
  const animation = getMascotAnimation(sessionPct, weeklyPct);

  return (
    <div ref={ref} style={{
      position: 'fixed',
      top: 0, left: 0,
      width: MASCOT_SIZE, height: MASCOT_SIZE,
      zIndex: 999,
      pointerEvents: 'none',
      willChange: 'transform',
    }}>
      <img
        src={mascotGif}
        width={MASCOT_SIZE}
        height={MASCOT_SIZE}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
          filter,
          animation,
          transition: 'filter 1s ease',
        }}
        alt="mascot"
      />
    </div>
  );
}
