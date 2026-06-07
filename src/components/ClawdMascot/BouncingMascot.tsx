import mascotGif from '../../assets/mascot.gif';
import { useBouncingMascot } from '../../hooks/useBouncingMascot';

const MASCOT_SIZE = 160;

type MoodState = 'idle' | 'happy' | 'focused' | 'stressed' | 'panic';

function getMood(sessionPct: number, weeklyPct: number): MoodState {
  const pct = Math.max(sessionPct, weeklyPct);
  if (pct >= 90) return 'panic';
  if (pct >= 80) return 'stressed';
  if (pct >= 61) return 'focused';
  if (pct >= 31) return 'happy';
  return 'idle';
}

const MOOD_ANIMATION: Record<MoodState, string> = {
  idle:     'mascotIdle 3s ease-in-out infinite',
  happy:    'mascotHappy 1.8s ease-in-out infinite',
  focused:  'mascotFocused 1.2s ease-in-out infinite',
  stressed: 'mascotStressed 0.8s ease-in-out infinite',
  panic:    'mascotPanic 0.45s ease-in-out infinite',
};

const MOOD_FILTER: Record<MoodState, string> = {
  idle:     'drop-shadow(0 0 6px rgba(102,204,68,0.27))',
  happy:    'drop-shadow(0 0 14px rgba(102,204,68,0.73))',
  focused:  'drop-shadow(0 0 12px rgba(255,184,0,0.67)) sepia(0.2)',
  stressed: 'drop-shadow(0 0 16px rgba(255,140,0,0.8)) sepia(0.5) saturate(1.3)',
  panic:    'drop-shadow(0 0 22px rgba(255,68,68,0.93)) hue-rotate(330deg) saturate(2)',
};

const MOOD_SPEED: Record<MoodState, number> = {
  idle:     1.2,
  happy:    1.8,
  focused:  2.2,
  stressed: 2.8,
  panic:    4.0,
};

interface Props {
  sessionPct: number;
  weeklyPct: number;
}

export function BouncingMascot({ sessionPct, weeklyPct }: Props) {
  const mood = getMood(sessionPct, weeklyPct);
  const { ref } = useBouncingMascot(MOOD_SPEED[mood]);

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
          filter: MOOD_FILTER[mood],
          animation: MOOD_ANIMATION[mood],
          transition: 'filter 1.2s ease, animation-duration 0.8s ease',
        }}
        alt="mascot"
      />
    </div>
  );
}
