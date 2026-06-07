import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '../stores/settingsStore';
import type { ActivateAfterOption, SleepAfterOption } from '../types';

function secondsToActivateAfter(s: number): ActivateAfterOption {
  if (s === 0)    return 'Never';
  if (s <= 60)   return '1 minute';
  if (s <= 300)  return '5 minutes';
  if (s <= 600)  return '10 minutes';
  if (s <= 900)  return '15 minutes';
  if (s <= 1800) return '30 minutes';
  if (s <= 3600) return '1 hour';
  if (s <= 7200) return '2 hours';
  return 'Never';
}

function secondsToSleepAfter(s: number): SleepAfterOption {
  if (s === 0)    return 'Never';
  if (s <= 900)   return '15 minutes';
  if (s <= 1800)  return '30 minutes';
  if (s <= 3600)  return '1 hour';
  return '2 hours';
}

const INIT_KEY = 'clawdclock-system-defaults-applied';

export function useSystemDefaults() {
  useEffect(() => {
    // Only apply once — skip if user has already customized settings
    if (localStorage.getItem(INIT_KEY)) return;

    Promise.all([
      invoke<number>('get_system_screensaver_timeout'),
      invoke<number>('get_system_sleep_timeout'),
    ]).then(([scr, sleep]) => {
      const { setActivateAfter, setSleepAfter } = useSettingsStore.getState();
      setActivateAfter(secondsToActivateAfter(scr));
      setSleepAfter(secondsToSleepAfter(sleep));
      localStorage.setItem(INIT_KEY, '1');
    }).catch(() => {});
  }, []);
}
