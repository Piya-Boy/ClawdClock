import type { ContributionDay } from '../../hooks/useGitHubContributions';
import type { Theme } from '../../themes';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  days: ContributionDay[];
  username: string;
  theme: Theme;
}

function levelColor(level: 0 | 1 | 2 | 3 | 4, healthy: string): string {
  if (level === 0) return 'rgba(255,255,255,0.05)';
  const alpha = [0, 0.25, 0.45, 0.7, 1][level];
  // parse healthy hex to rgba
  const r = parseInt(healthy.slice(1, 3), 16);
  const g = parseInt(healthy.slice(3, 5), 16);
  const b = parseInt(healthy.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function ContributionGrid({ days, username, theme }: Props) {
  const totalCount = days.reduce((s, d) => s + d.count, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontSize: 14, fontWeight: 700,
        letterSpacing: '0.18em',
        color: theme.labelColor,
        fontFamily: FF,
      }}>
        GITHUB
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Grid — 6 rows × 5 cols = 30 days */}
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(5, 18px)',
          gridTemplateColumns: `repeat(${Math.ceil(days.length / 5)}, 18px)`,
          gridAutoFlow: 'column',
          gap: 4,
        }}>
          {days.map(d => (
            <div
              key={d.date}
              title={`${d.date}: ${d.count} contributions`}
              style={{
                width: 18, height: 18, borderRadius: 4,
                background: levelColor(d.level, theme.healthy),
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontSize: 38, fontWeight: 800, lineHeight: 1,
            color: totalCount > 0 ? theme.healthy : theme.labelColor,
            fontFamily: FF,
            transition: 'color 0.5s ease',
          }}>
            {totalCount}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: theme.labelColor, fontFamily: FF,
            letterSpacing: '0.1em',
          }}>
            LAST 30 DAYS
          </div>
          <div style={{
            fontSize: 11, color: theme.resetColor, fontFamily: FF,
            letterSpacing: '0.06em',
          }}>
            @{username}
          </div>
        </div>
      </div>
    </div>
  );
}
