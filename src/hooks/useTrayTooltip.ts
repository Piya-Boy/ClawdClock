import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useTrayTooltip(sessionPct: number, weeklyPct: number) {
  useEffect(() => {
    if (import.meta.env.DEV) return;
    const tooltip = `ClawdClock\nSession: ${sessionPct}%\nWeekly: ${weeklyPct}%`;
    invoke('update_tray_tooltip', { tooltip }).catch(() => {});
  }, [sessionPct, weeklyPct]);
}
