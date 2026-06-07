import { useState, useEffect, useRef } from 'react';

const CW = 310;
const CH = 388;
const HH = CH / 2;
const FS = 350;
const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const C_CARD_TOP = '#121212';
const C_CARD_BOT = '#0b0b0b';
const C_FOLD = '#000000';

const topNumStyle: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0,
  width: CW, height: CH,
  fontSize: FS, lineHeight: `${CH}px`,
  fontFamily: FF, fontWeight: 900,
  color: '#ffffff', textAlign: 'center',
  userSelect: 'none', letterSpacing: '-0.015em',
};

const botNumStyle: React.CSSProperties = {
  ...topNumStyle,
  top: -HH,
  color: '#c0c0c0',
};

interface Props {
  value: string;
}

export function FlipDigit({ value }: Props) {
  const prevRef  = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [st, setSt] = useState({ curr: value, prev: value, flip: false });

  useEffect(() => {
    if (value !== prevRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const old = prevRef.current;
      prevRef.current = value;
      setSt({ curr: value, prev: old, flip: true });
      timerRef.current = setTimeout(
        () => setSt(s => ({ ...s, flip: false })),
        740
      );
    }
  }, [value]);

  const { curr, prev, flip } = st;

  return (
    <div style={{ position: 'relative', width: CW, height: CH, flexShrink: 0 }}>

      {/* static top half: always shows curr */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: CW, height: HH,
        overflow: 'hidden',
        background: C_CARD_TOP,
        borderRadius: '10px 10px 0 0',
      }}>
        <div style={topNumStyle}>{curr}</div>
      </div>

      {/* static bottom half: shows prev while flipping, then curr */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: CW, height: HH,
        overflow: 'hidden',
        background: C_CARD_BOT,
        borderRadius: '0 0 10px 10px',
      }}>
        <div style={botNumStyle}>{flip ? prev : curr}</div>
      </div>

      {/* fold line */}
      <div style={{
        position: 'absolute', top: HH - 1, left: 0,
        width: '100%', height: 3,
        background: C_FOLD, zIndex: 30,
        pointerEvents: 'none',
      }} />

      {/* notches */}
      {[[-6, HH - 8], [CW - 4, HH - 8]].map(([left, top], i) => (
        <div key={i} style={{
          position: 'absolute', top, left,
          width: 10, height: 16, borderRadius: 3,
          background: C_FOLD, zIndex: 31,
          pointerEvents: 'none',
        }} />
      ))}

      {/* animated flaps — only while flipping */}
      {flip && (
        <>
          {/* upper flap: prev digit top — folds forward and away */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: CW, height: HH,
            overflow: 'hidden',
            background: C_CARD_TOP,
            borderRadius: '10px 10px 0 0',
            transformOrigin: 'center bottom',
            animation: 'flipUpperOut 0.31s cubic-bezier(0.55,0,1,0.45) forwards',
            zIndex: 24,
            willChange: 'transform',
          }}>
            <div style={topNumStyle}>{prev}</div>
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '100%', height: 40,
              background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.35))',
              pointerEvents: 'none',
            }} />
          </div>

          {/* lower flap: curr digit bottom — unfolds from above */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: CW, height: HH,
            overflow: 'hidden',
            background: C_CARD_BOT,
            borderRadius: '0 0 10px 10px',
            transformOrigin: 'center top',
            animation: 'flipLowerIn 0.31s cubic-bezier(0,0.55,0.45,1) 0.31s both',
            transform: 'perspective(800px) rotateX(90deg)',
            zIndex: 24,
            willChange: 'transform',
          }}>
            <div style={botNumStyle}>{curr}</div>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: 40,
              background: 'linear-gradient(to top, transparent, rgba(0,0,0,0.28))',
              pointerEvents: 'none',
            }} />
          </div>

          {/* shadow cast on lower-static from upper flap */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: CW, height: HH,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '0 0 10px 10px',
            animation: 'shadowFade 0.31s ease-out forwards',
            zIndex: 23,
            pointerEvents: 'none',
          }} />
        </>
      )}
    </div>
  );
}
