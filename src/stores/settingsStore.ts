import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import type { SettingsState, ActivateAfterOption, SleepAfterOption, TimeFormat } from '../types';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      activateAfter: '5 minutes',
      sleepAfter: 'Never',
      timeFormat: '24',
      launchAtStartup: false,
      selectedMonitor: 0,
      setActivateAfter: (v: ActivateAfterOption) => set({ activateAfter: v }),
      setSleepAfter: (v: SleepAfterOption) => set({ sleepAfter: v }),
      setTimeFormat: (v: TimeFormat) => set({ timeFormat: v }),
      setLaunchAtStartup: (v: boolean) => {
        set({ launchAtStartup: v });
        invoke('set_autostart', { enable: v }).catch(() => {});
      },
      setSelectedMonitor: (v: number) => set({ selectedMonitor: v }),
    }),
    { name: 'clawdclock-settings' }
  )
);
