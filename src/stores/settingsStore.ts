import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import type { SettingsState, ActivateAfterOption, SleepAfterOption, TimeFormat, CheckFrequencyOption, UpdateChannel } from '../types';
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
      autoUpdate: true,
      checkFrequency: '5 minutes' as CheckFrequencyOption,
      updateChannel: 'stable' as UpdateChannel,
      clockHotkey: 'Ctrl+Shift+L',
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
      setAutoUpdate: (v: boolean) => set({ autoUpdate: v }),
      setCheckFrequency: (v: CheckFrequencyOption) => set({ checkFrequency: v }),
      setUpdateChannel: (v: UpdateChannel) => set({ updateChannel: v }),
      setClockHotkey: (v: string) => set({ clockHotkey: v }),
    }),
    { name: 'clawdclock-settings' }
  )
);
