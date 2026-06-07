import type { Achievement } from '../../hooks/useAchievements';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const C_ACC = '#FF6B3D';

interface Props {
  achievements: Achievement[];
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AchievementsPanel({ achievements, onClose }: Props) {
  const unlocked = achievements.filter(a => a.unlockedAt).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 480, maxHeight: 480,
        background: '#111', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', fontFamily: FF, letterSpacing: '0.04em' }}>
              ACHIEVEMENTS
            </span>
            <span style={{ fontSize: 11, color: C_ACC, fontFamily: FF, fontWeight: 700 }}>
              {unlocked}/{achievements.length}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#444', fontSize: 18, lineHeight: 1, padding: '0 2px', fontFamily: FF,
          }}>×</button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '8px 0' }}>
          {achievements.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 20px',
              opacity: a.unlockedAt ? 1 : 0.3,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: a.unlockedAt ? `${C_ACC}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${a.unlockedAt ? C_ACC + '44' : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {a.unlockedAt ? '🏆' : '🔒'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#e0e0e0', fontFamily: FF }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 11, color: '#444', fontFamily: FF, marginTop: 2 }}>
                  {a.desc}
                </div>
              </div>
              {a.unlockedAt && (
                <div style={{ fontSize: 10, color: '#333', fontFamily: FF, flexShrink: 0 }}>
                  {formatDate(a.unlockedAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
