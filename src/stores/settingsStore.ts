import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState, ActivateAfterOption, SleepAfterOption, TimeFormat } from '../types';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      activateAfter: '5 minutes',
      sleepAfter: 'Never',
      timeFormat: '24',
      setActivateAfter: (v: ActivateAfterOption) => set({ activateAfter: v }),
      setSleepAfter: (v: SleepAfterOption) => set({ sleepAfter: v }),
      setTimeFormat: (v: TimeFormat) => set({ timeFormat: v }),
    }),
    { name: 'clawdclock-settings' }
  )
);
