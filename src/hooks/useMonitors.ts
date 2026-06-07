import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { MonitorInfo } from '../types';

export function useMonitors(): MonitorInfo[] {
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);

  useEffect(() => {
    invoke<MonitorInfo[]>('list_monitors')
      .then(setMonitors)
      .catch(() => setMonitors([]));
  }, []);

  return monitors;
}
