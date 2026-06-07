import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '../stores/settingsStore';

export function useHotkey() {
  const { clockHotkey } = useSettingsStore();
  const applied = useRef('');

  useEffect(() => {
    if (import.meta.env.DEV) return;
    if (clockHotkey === applied.current) return;
    invoke('set_clock_hotkey', { hotkey: clockHotkey }).catch(() => {});
    applied.current = clockHotkey;
  }, [clockHotkey]);
}
