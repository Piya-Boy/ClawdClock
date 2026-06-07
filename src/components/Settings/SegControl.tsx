const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Option {
  val: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}

export function SegControl({ value, options, onChange }: Props) {
  return (
    <div style={{
      display: 'flex', background: '#0f0f0f',
      border: '1px solid #1f1f1f', borderRadius: 7, padding: 2, gap: 1,
    }}>
      {options.map(o => (
        <button
          key={o.val}
          className={`seg-btn ${value === o.val ? 'seg-active' : ''}`}
          onClick={() => onChange(o.val)}
          style={{
            padding: '5px 18px',
            fontSize: 11, fontWeight: 700, fontFamily: FF,
            border: 'none', borderRadius: 5, cursor: 'pointer',
            background: value === o.val ? '#e2e2e2' : 'transparent',
            color: value === o.val ? '#090909' : '#484848',
            transition: 'all 0.12s ease', whiteSpace: 'nowrap',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
