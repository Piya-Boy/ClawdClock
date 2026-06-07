import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '../stores/settingsStore';

const CHECK_INTERVAL_MS = 3_600_000; // 1 hour
const UPDATE_CHANNEL = 'stable';

export interface UpdateState {
  checking: boolean;
  available: boolean;
  version: string | null;
  body: string | null;
  downloadUrl: string | null;
  downloadSize: number | null;
  installing: boolean;
  rollingBack: boolean;
  error: string | null;
  lastChecked: Date | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function fetchDownloadSize(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    const cl = res.headers.get('content-length');
    return cl ? parseInt(cl, 10) : null;
  } catch {
    return null;
  }
}

export function useUpdater() {
  const [state, setState] = useState<UpdateState>({
    checking: false,
    available: false,
    version: null,
    body: null,
    downloadUrl: null,
    downloadSize: null,
    installing: false,
    rollingBack: false,
    error: null,
    lastChecked: null,
  });

  const { autoUpdate } = useSettingsStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = async () => {
    if (import.meta.env.DEV) return;
    setState(s => ({ ...s, checking: true, error: null }));
    try {
      const channel = UPDATE_CHANNEL;
      const result = await invoke<{ version: string; body: string | null; download_url: string | null } | null>('check_for_update_channel', { channel });
      let downloadSize: number | null = null;
      if (result?.download_url) {
        downloadSize = await fetchDownloadSize(result.download_url);
      }
      setState(s => ({
        ...s,
        checking: false,
        available: result != null,
        version: result?.version ?? null,
        body: result?.body ?? null,
        downloadUrl: result?.download_url ?? null,
        downloadSize,
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

  const rollback = async () => {
    setState(s => ({ ...s, rollingBack: true, error: null }));
    try {
      await invoke('rollback_update');
      setState(s => ({ ...s, rollingBack: false }));
    } catch (e) {
      setState(s => ({ ...s, rollingBack: false, error: String(e) }));
    }
  };

  useEffect(() => {
    if (!autoUpdate) return;

    check();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoUpdate]);

  return { ...state, formatSize: (n: number) => formatBytes(n), check, install, rollback };
}
