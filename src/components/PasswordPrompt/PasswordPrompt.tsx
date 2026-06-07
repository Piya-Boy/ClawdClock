import { useState, useEffect, useRef } from 'react';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  validate: (input: string) => boolean;
}

export function PasswordPrompt({ onSuccess, onCancel, validate }: Props) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (validate(value)) {
      onSuccess();
    } else {
      setShake(true);
      setValue('');
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        animation: shake ? 'shakeX 0.5s ease' : undefined,
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: '0.2em',
          color: '#444', fontFamily: FF,
        }}>
          ENTER PASSWORD TO UNLOCK
        </div>

        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKey}
          style={{
            width: 220,
            padding: '12px 16px',
            background: '#111',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#fff',
            fontFamily: FF,
            fontSize: 20,
            textAlign: 'center',
            letterSpacing: '0.3em',
            outline: 'none',
          }}
          placeholder="••••••••"
          autoComplete="off"
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 24px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              color: '#444', fontFamily: FF, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              padding: '8px 24px',
              background: '#FF6B3D',
              border: 'none', borderRadius: 6,
              color: '#fff', fontFamily: FF, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            Unlock
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shakeX {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-12px); }
          40%      { transform: translateX(12px); }
          60%      { transform: translateX(-8px); }
          80%      { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
