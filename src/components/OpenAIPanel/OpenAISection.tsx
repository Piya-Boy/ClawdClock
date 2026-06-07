import type { OpenAIUsage } from '../../hooks/useOpenAIUsage';
import type { Theme } from '../../themes';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  usage: OpenAIUsage;
  theme: Theme;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function OpenAISection({ usage, theme }: Props) {
  if (!usage.available) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontSize: 14, fontWeight: 700,
        letterSpacing: '0.18em',
        color: theme.labelColor,
        fontFamily: FF,
      }}>
        OPENAI
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontSize: 42, fontWeight: 800, lineHeight: 1,
            color: usage.totalTokens > 0 ? theme.healthy : theme.labelColor,
            fontFamily: FF,
          }}>
            {formatTokens(usage.totalTokens)}
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: theme.labelColor, fontFamily: FF,
            letterSpacing: '0.12em',
          }}>
            TOKENS TODAY
          </div>
        </div>

        {usage.totalRequests > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{
              fontSize: 28, fontWeight: 700, lineHeight: 1,
              color: theme.resetColor, fontFamily: FF,
            }}>
              {usage.totalRequests}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: theme.labelColor, fontFamily: FF,
              letterSpacing: '0.12em',
            }}>
              REQUESTS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
