import mascotGif from '../../assets/mascot.gif';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const TITLE_H = 40;

export function TitleBar() {
  return (
    <div style={{
      height: TITLE_H, minHeight: TITLE_H,
      background: '#0d0d0d',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingLeft: 14, userSelect: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <img src={mascotGif} width={19} height={19} style={{ imageRendering: 'pixelated', display: 'block' }} alt="mascot" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#646464', fontFamily: FF, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
          ClawdClock Settings
        </span>
      </div>
      <div style={{ display: 'flex', height: TITLE_H }}>
        {[
          { cls: 'wbtn-min', content: <rect x="6" y="9.5" width="6" height="1.4" fill="#aaa" rx="0.4"/> },
          { cls: 'wbtn-max', content: <rect x="5.5" y="5.5" width="7" height="7" stroke="#aaa" strokeWidth="1.1" fill="none"/> },
          { cls: 'wbtn-close', content: (
            <>
              <line className="close-line" x1="5.5" y1="5.5" x2="12.5" y2="12.5" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
              <line className="close-line" x1="12.5" y1="5.5" x2="5.5" y2="12.5" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
            </>
          )},
        ].map((btn, i) => (
          <div key={i} className={btn.cls} style={{
            width: 46, height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'default', transition: 'background 0.1s ease',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18">{btn.content}</svg>
          </div>
        ))}
      </div>
    </div>
  );
}
