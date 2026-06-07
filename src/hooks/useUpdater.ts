import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '../stores/settingsStore';
import type { CheckFrequencyOption } from '../types';

export interface UpdateState {
  checking: boolean;
  available: boolean;
  version: string | null;
  body: string | null;
  downloadUrl: string | null;
  downloadSize: number | null;
  installing: boolean;
  error: string | null;
  lastChecked: Date | null;
}

function freqToMs(freq: CheckFrequencyOption): number | null {
  const map: Record<CheckFrequencyOption, number | null> = {
    'On Startup': null,
    '1 minute':   60_000,
    '5 minutes':  300_000,
    '30 minutes': 1_800_000,
    '1 hour':     3_600_000,
  };
  return map[freq];
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
    error: null,
    lastChecked: null,
  });

  const { autoUpdate, checkFrequency, updateChannel } = useSettingsStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = async () => {
    if (import.meta.env.DEV) return;
    setState(s => ({ ...s, checking: true, error: null }));
    const channel = useSettingsStore.getState().updateChannel;
    try {
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

  useEffect(() => {
    if (!autoUpdate) return;

    check();

    if (intervalRef.current) clearInterval(intervalRef.current);
    const ms = freqToMs(checkFrequency);
    if (ms) {
      intervalRef.current = setInterval(check, ms);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoUpdate, checkFrequency, updateChannel]);

  return { ...state, formatSize: (n: number) => formatBytes(n), check, install };
}
