import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface UpdateState {
  checking: boolean;
  available: boolean;
  version: string | null;
  body: string | null;
  installing: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    available: false,
    version: null,
    body: null,
    installing: false,
    error: null,
    lastChecked: null,
  });

  const check = async () => {
    if (import.meta.env.DEV) return;
    setState(s => ({ ...s, checking: true, error: null }));
    try {
      const result = await invoke<{ version: string; body: string | null } | null>('check_for_update');
      setState(s => ({
        ...s,
        checking: false,
        available: result != null,
        version: result?.version ?? null,
        body: result?.body ?? null,
        lastChecked: new Date(),
      }));
    } catch (e) {
      setState(s => ({ ...s, checking: false, error: String(e), lastChecked: new Date() }));
    }
  };

  const install = async () => {
    setState(s => ({ ...s, installing: true, error: null }));
    try {
      await invoke('install_update');
    } catch (e) {
      setState(s => ({ ...s, installing: false, error: String(e) }));
    }
  };

  useEffect(() => {
    check();
  }, []);

  return { ...state, check, install };
}
