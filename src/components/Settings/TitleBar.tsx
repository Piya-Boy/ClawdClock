import appIcon from '../../assets/logo.png';
import { getCurrentWindow } from '@tauri-apps/api/window';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";
const TITLE_H = 40;

const win = getCurrentWindow();

export function TitleBar() {
  return (
    <div
      data-tauri-drag-region
      style={{
        height: TITLE_H, minHeight: TITLE_H,
        background: '#0d0d0d',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingLeft: 14, userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <img src={appIcon} width={19} height={19} style={{ imageRendering: 'pixelated', display: 'block' }} alt="ClawdClock" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#646464', fontFamily: FF, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
          ClawdClock Settings
        </span>
      </div>
      <div style={{ display: 'flex', height: TITLE_H }}>
        <div
          className="wbtn-min"
          onClick={() => win.minimize()}
          style={{ width: 46, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', transition: 'background 0.1s ease' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <rect x="6" y="9.5" width="6" height="1.4" fill="#aaa" rx="0.4"/>
          </svg>
        </div>
        <div
          className="wbtn-close"
          onClick={() => win.hide()}
          style={{ width: 46, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', transition: 'background 0.1s ease' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <line className="close-line" x1="5.5" y1="5.5" x2="12.5" y2="12.5" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
            <line className="close-line" x1="12.5" y1="5.5" x2="5.5" y2="12.5" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
