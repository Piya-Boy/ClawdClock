interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: Props) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 36, height: 20,
        borderRadius: 10,
        background: value ? '#FF6B3D' : '#222',
        border: `1px solid ${value ? '#FF6B3D' : 'rgba(255,255,255,0.08)'}`,
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2, left: value ? 17 : 2,
        width: 14, height: 14,
        borderRadius: '50%',
        background: value ? '#fff' : '#555',
        transition: 'left 0.2s ease, background 0.2s ease',
      }} />
    </div>
  );
}
