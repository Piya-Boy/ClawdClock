import type { Achievement } from '../../hooks/useAchievements';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const C_ACC = '#FF6B3D';

interface Props {
  achievement: Achievement | null;
}

export function AchievementToast({ achievement }: Props) {
  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      background: '#111',
      border: `1px solid ${C_ACC}44`,
      borderRadius: 10,
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px ${C_ACC}22`,
      animation: 'toastIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
      maxWidth: 320,
    }}>
      <div style={{
        fontSize: 28, lineHeight: 1, flexShrink: 0,
      }}>🏆</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: C_ACC,
          fontFamily: FF, letterSpacing: '0.16em',
        }}>
          ACHIEVEMENT UNLOCKED
        </div>
        <div style={{
          fontSize: 13, fontWeight: 800, color: '#e0e0e0',
          fontFamily: FF,
        }}>
          {achievement.title}
        </div>
        <div style={{
          fontSize: 11, color: '#555', fontFamily: FF,
        }}>
          {achievement.desc}
        </div>
      </div>
    </div>
  );
}
