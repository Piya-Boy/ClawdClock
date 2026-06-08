import type { ReactNode } from 'react';

const C_ACC = '#FF6B3D';

// Inline: **bold**, `code`, [text](url). Returns React nodes.
function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(<strong key={`${keyBase}-b${i}`} style={{ color: '#cfcfcf', fontWeight: 700 }}>{m[2]}</strong>);
    } else if (m[3]) {
      out.push(
        <code key={`${keyBase}-c${i}`} style={{
          fontFamily: 'monospace', fontSize: '0.92em',
          background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4, color: '#d0d0d0',
        }}>{m[4]}</code>
      );
    } else if (m[5]) {
      out.push(
        <a key={`${keyBase}-l${i}`} href={m[7]} target="_blank" rel="noreferrer"
           style={{ color: C_ACC, textDecoration: 'none' }}>{m[6]}</a>
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Block-level: #/##/### headings, - or * bullets, blank lines, paragraphs.
// Enough for GitHub release notes; not a full CommonMark implementation.
export function renderMarkdown(md: string): ReactNode {
  if (!md) return null;
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let key = 0;

  const flushBullets = () => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={`ul${key++}`} style={{ margin: '4px 0 10px', paddingLeft: 18 }}>
        {items.map((b, j) => (
          <li key={j} style={{ marginBottom: 3 }}>{renderInline(b, `ul${key}-${j}`)}</li>
        ))}
      </ul>
    );
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);

    if (heading) {
      flushBullets();
      const level = heading[1].length;
      const size = level === 1 ? 15 : level === 2 ? 13.5 : 12.5;
      blocks.push(
        <div key={`h${key++}`} style={{
          fontSize: size, fontWeight: 800, color: '#d8d8d8',
          margin: '12px 0 4px', letterSpacing: '0.01em',
        }}>{renderInline(heading[2], `h${key}`)}</div>
      );
    } else if (bullet) {
      bullets.push(bullet[1]);
    } else if (line.trim() === '') {
      flushBullets();
    } else {
      flushBullets();
      blocks.push(
        <p key={`p${key++}`} style={{ margin: '0 0 8px' }}>{renderInline(line, `p${key}`)}</p>
      );
    }
  }
  flushBullets();
  return <>{blocks}</>;
}
