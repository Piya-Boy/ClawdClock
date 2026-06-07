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
    '1 hour':     3600,
    '2 hours':    7200,
    'Never':      Infinity,
  };
  return map[value] ?? 300;
}

export function useIdleDetection() {
  const { activateAfter, selectedMonitor, hideTaskbar } = useSettingsStore();
  const clockVisible = useRef(false);

  useEffect(() => {
    const thresholdSeconds = parseActivateAfterSeconds(activateAfter);

    const poll = async () => {
      try {
        const idle = await invoke<number>('get_idle_seconds');
        const shouldShow = idle >= thresholdSeconds;

        if (shouldShow && !clockVisible.current) {
          if (hideTaskbar) invoke('set_taskbar_visible', { visible: false }).catch(() => {});
          if (selectedMonitor === -1) {
            await invoke('show_clock_on_all_monitors');
          } else {
            await invoke('show_clock_on_monitor', { monitorId: selectedMonitor });
          }
          clockVisible.current = true;
        } else if (!shouldShow && clockVisible.current) {
          if (selectedMonitor === -1) {
            await invoke('hide_clock_all_monitors');
          } else {
            await invoke('hide_clock_window');
          }
          if (hideTaskbar) invoke('set_taskbar_visible', { visible: true }).catch(() => {});
          clockVisible.current = false;
        }
      } catch {
        // non-fatal: Tauri not available in browser dev
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [activateAfter, selectedMonitor, hideTaskbar]);
}
