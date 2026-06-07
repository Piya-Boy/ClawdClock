import { ReactNode } from 'react';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  label: string;
  desc?: string;
  control: ReactNode;
}

export function SettingRow({ label, desc, control }: Props) {
  return (
    <div style={{ padding: '17px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 172px', alignItems: 'center', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#d4d4d4', fontFamily: FF, lineHeight: 1 }}>{label}</div>
          {desc && (
            <div style={{ fontSize: 11, color: '#383838', fontFamily: FF, marginTop: 4, lineHeight: 1.55 }}>{desc}</div>
          )}
        </div>
        <div>{control}</div>
      </div>
    </div>
  );
}
