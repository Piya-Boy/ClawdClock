import { useState } from 'react';
import type { Release } from '../../hooks/useChangelog';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const C_ACC = '#FF6B3D';

interface Props {
  releases: Release[];
  onClose: () => void;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ChangelogPanel({ releases, onClose }: Props) {
  const [selected, setSelected] = useState(0);
  const rel = releases[selected];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: 620, maxHeight: 460,
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
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', fontFamily: FF, letterSpacing: '0.04em' }}>
            CHANGELOG
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#444', fontSize: 18, lineHeight: 1, padding: '0 2px',
            fontFamily: FF,
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* Version list */}
          <div style={{
            width: 140, borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowY: 'auto', flexShrink: 0,
          }}>
            {releases.map((r, i) => (
              <button key={r.version} onClick={() => setSelected(i)} style={{
                width: '100%', textAlign: 'left',
                padding: '10px 14px',
                background: i === selected ? 'rgba(255,107,61,0.1)' : 'transparent',
                border: 'none',
                borderLeft: `2px solid ${i === selected ? C_ACC : 'transparent'}`,
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: i === selected ? '#e0e0e0' : '#555', fontFamily: FF }}>
                  v{r.version}
                </div>
                <div style={{ fontSize: 10, color: '#333', fontFamily: FF, marginTop: 2 }}>
                  {formatDate(r.publishedAt)}
                </div>
              </button>
            ))}
          </div>

          {/* Release notes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {rel ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#e0e0e0', fontFamily: FF, marginBottom: 4 }}>
                  {rel.name || `v${rel.version}`}
                </div>
                <div style={{ fontSize: 10, color: '#444', fontFamily: FF, marginBottom: 12 }}>
                  {formatDate(rel.publishedAt)}
                </div>
                <div style={{
                  fontSize: 12, color: '#666', fontFamily: FF,
                  lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {rel.body || 'No release notes.'}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#333', fontFamily: FF }}>No releases found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
