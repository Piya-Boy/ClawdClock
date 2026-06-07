import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '../stores/settingsStore';

const POLL_INTERVAL_MS = 5_000;

function parseActivateAfterSeconds(value: string): number {
  const map: Record<string, number> = {
    '1 minute':   60,
    '5 minutes':  300,
    '10 minutes': 600,
    '15 minutes': 900,
    '30 minutes': 1800,
  };
  return map[value] ?? 300;
}

export function useIdleDetection() {
  const { activateAfter, selectedMonitor } = useSettingsStore();
  const clockVisible = useRef(false);

  useEffect(() => {
    const thresholdSeconds = parseActivateAfterSeconds(activateAfter);

    const poll = async () => {
      try {
        const idle = await invoke<number>('get_idle_seconds');
        const shouldShow = idle >= thresholdSeconds;

        if (shouldShow && !clockVisible.current) {
          await invoke('show_clock_on_monitor', { monitorId: selectedMonitor });
          clockVisible.current = true;
        } else if (!shouldShow && clockVisible.current) {
          await invoke('hide_clock_window');
          clockVisible.current = false;
        }
      } catch {
        // non-fatal: Tauri not available in browser dev
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [activateAfter, selectedMonitor]);
}
