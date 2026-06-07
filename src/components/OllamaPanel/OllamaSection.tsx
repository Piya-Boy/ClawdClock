import type { Theme } from '../../themes';
import type { OllamaModel } from '../../hooks/useOllamaStatus';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  available: boolean;
  running: OllamaModel[];
  theme: Theme;
}

function shortModelName(name: string): string {
  // "llama3.2:latest" -> "llama3.2", "mistral:7b-instruct" -> "mistral:7b"
  return name.replace(/:latest$/, '').replace(/(-instruct|-chat|-base)$/, '');
}

export function OllamaSection({ available, running, theme }: Props) {
  if (!available) return null;

  const isActive = running.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        fontSize: 14, fontWeight: 700,
        letterSpacing: '0.18em',
        color: theme.labelColor,
        fontFamily: FF,
      }}>
        OLLAMA
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          background: isActive ? theme.healthy : theme.labelColor,
          boxShadow: isActive ? `0 0 8px ${theme.healthy}` : 'none',
          transition: 'background 0.5s ease, box-shadow 0.5s ease',
        }} />
        <div style={{
          fontSize: 28, fontWeight: 800,
          color: isActive ? theme.healthy : theme.labelColor,
          fontFamily: FF, letterSpacing: '0.02em',
          transition: 'color 0.5s ease',
        }}>
          {isActive
            ? running.map(m => shortModelName(m.name)).join(' · ')
            : 'IDLE'}
        </div>
      </div>
    </div>
  );
}
