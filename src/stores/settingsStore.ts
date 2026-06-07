import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import type { SettingsState, ActivateAfterOption, SleepAfterOption, TimeFormat } from '../types';
import type { ThemeId } from '../themes';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      activateAfter: '5 minutes',
      sleepAfter: 'Never',
      timeFormat: '24',
      theme: 'classic' as ThemeId,
      oledMode: false,
      lockPassword: '',
      launchAtStartup: false,
      selectedMonitor: 0,
      lockScreenEnabled: false,
      setActivateAfter: (v: ActivateAfterOption) => set({ activateAfter: v }),
      setSleepAfter: (v: SleepAfterOption) => set({ sleepAfter: v }),
      setTimeFormat: (v: TimeFormat) => set({ timeFormat: v }),
      setTheme: (v: ThemeId) => set({ theme: v }),
      setOledMode: (v: boolean) => set({ oledMode: v }),
      setLockPassword: (v: string) => set({ lockPassword: v }),
      setLaunchAtStartup: (v: boolean) => {
        set({ launchAtStartup: v });
        invoke('set_autostart', { enable: v }).catch(() => {});
      },
      setSelectedMonitor: (v: number) => set({ selectedMonitor: v }),
      setLockScreenEnabled: (v: boolean) => set({ lockScreenEnabled: v }),
    }),
    { name: 'clawdclock-settings' }
  )
);
