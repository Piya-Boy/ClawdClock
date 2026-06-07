import { useState, useEffect, useRef } from 'react';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const C_ACC = '#FF6B3D';

interface Props {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

export function Dropdown({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: 172 }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 11px', gap: 8,
          background: open ? '#1d1d1d' : '#151515',
          border: `1px solid ${open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 6, cursor: 'pointer',
          fontSize: 12, fontWeight: 500, color: '#ccc',
          fontFamily: FF, userSelect: 'none',
          transition: 'all 0.1s ease',
        }}
      >
        <span style={{ whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{value}</span>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ flexShrink: 0, transition: 'transform 0.15s ease', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M0.5 0.5L4 4L7.5 0.5" stroke="#4a4a4a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, zIndex: 300,
          background: '#161616', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.95)',
        }}>
          {options.map(opt => (
            <div
              key={opt}
              className={`drop-item ${opt === value ? 'active' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '9px 12px',
                fontSize: 12, fontWeight: 500,
                color: opt === value ? C_ACC : '#c0c0c0',
                fontFamily: FF, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'background 0.08s',
              }}
            >
              <span>{opt}</span>
              {opt === value && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.8 6.8L9 1" stroke={C_ACC} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
