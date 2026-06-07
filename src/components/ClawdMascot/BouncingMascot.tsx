import mascotGif from '../../assets/mascot.gif';
import { useBouncingMascot } from '../../hooks/useBouncingMascot';

const MASCOT_SIZE = 160;

export function BouncingMascot() {
  const { ref } = useBouncingMascot();

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
        style={{ display: 'block', imageRendering: 'pixelated' }}
        alt="mascot"
      />
    </div>
  );
}
