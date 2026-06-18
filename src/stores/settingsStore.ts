import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import type { SettingsState, ActivateAfterOption, SleepAfterOption, TimeFormat, DateFormat, DateEra } from '../types';
import type { ThemeId } from '../themes';

const SYNC_EVENT = 'settings-changed';

// Keys that represent persisted settings values (not action functions).
type SettingsValues = Pick<
  SettingsState,
  'activateAfter' | 'sleepAfter' | 'timeFormat' | 'theme' | 'oledMode'
  | 'launchAtStartup' | 'selectedMonitor' | 'lockScreenEnabled' | 'autoUpdate' | 'clockHotkey'
  | 'dateFormat' | 'dateEra'
>;

// Guard against echo: when applying a change received from another window,
// don't re-emit it.
let applyingRemote = false;

async function emitChange(patch: Partial<SettingsValues>) {
  if (applyingRemote) return;
  try {
    const { emit } = await import('@tauri-apps/api/event');
    await emit(SYNC_EVENT, patch);
  } catch {
    // Tauri not available (browser dev) — ignore.
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => {
      // set() wrapper: apply locally + broadcast to other windows.
      const setSync = (patch: Partial<SettingsValues>) => {
        set(patch as Partial<SettingsState>);
        emitChange(patch);
      };

      return {
        activateAfter: '5 minutes',
        sleepAfter: 'Never',
        timeFormat: '24',
        theme: 'classic' as ThemeId,
        oledMode: false,
        launchAtStartup: false,
        selectedMonitor: 0,
        lockScreenEnabled: false,
        autoUpdate: true,
        clockHotkey: 'Ctrl+Shift+L',
        dateFormat: 'none' as DateFormat,
        dateEra: 'CE' as DateEra,
        setActivateAfter: (v: ActivateAfterOption) => setSync({ activateAfter: v }),
        setSleepAfter: (v: SleepAfterOption) => setSync({ sleepAfter: v }),
        setTimeFormat: (v: TimeFormat) => setSync({ timeFormat: v }),
        setTheme: (v: ThemeId) => setSync({ theme: v }),
        setOledMode: (v: boolean) => setSync({ oledMode: v }),
        setLaunchAtStartup: (v: boolean) => {
          setSync({ launchAtStartup: v });
          invoke('set_autostart', { enable: v }).catch(() => {});
        },
        setSelectedMonitor: (v: number) => setSync({ selectedMonitor: v }),
        setLockScreenEnabled: (v: boolean) => setSync({ lockScreenEnabled: v }),
        setAutoUpdate: (v: boolean) => setSync({ autoUpdate: v }),
        setClockHotkey: (v: string) => setSync({ clockHotkey: v }),
        setDateFormat: (v: DateFormat) => setSync({ dateFormat: v }),
        setDateEra: (v: DateEra) => setSync({ dateEra: v }),
      };
    },
    {
      name: 'clawdclock-settings',
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SettingsValues>),
        dateFormat: (persisted as any)?.dateFormat ?? current.dateFormat,
        dateEra: (persisted as any)?.dateEra ?? current.dateEra,
      }),
    }
  )
);

// Listen for changes broadcast from other windows and apply them locally.
(async () => {
  try {
    const { listen } = await import('@tauri-apps/api/event');
    await listen<Partial<SettingsValues>>(SYNC_EVENT, (e) => {
      applyingRemote = true;
      useSettingsStore.setState(e.payload as Partial<SettingsState>);
      applyingRemote = false;
    });
  } catch {
    // Tauri not available — ignore.
  }
})();
