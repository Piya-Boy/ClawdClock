export type TimeFormat = '24' | '12';

export type ActivateAfterOption =
  | '1 minute'
  | '5 minutes'
  | '10 minutes'
  | '15 minutes'
  | '30 minutes';

export type SleepAfterOption =
  | 'Never'
  | '15 minutes'
  | '30 minutes'
  | '1 hour'
  | '2 hours';

export type UsageStatus = 'healthy' | 'warning' | 'critical';

export interface SettingsState {
  activateAfter: ActivateAfterOption;
  sleepAfter: SleepAfterOption;
  timeFormat: TimeFormat;
  launchAtStartup: boolean;
  selectedMonitor: number;
  lockScreenEnabled: boolean;
  setActivateAfter: (v: ActivateAfterOption) => void;
  setSleepAfter: (v: SleepAfterOption) => void;
  setTimeFormat: (v: TimeFormat) => void;
  setLaunchAtStartup: (v: boolean) => void;
  setSelectedMonitor: (v: number) => void;
  setLockScreenEnabled: (v: boolean) => void;
}

export interface UsageData {
  sessionUsage: number;
  weeklyUsage: number;
  sessionResetAt: string;
  weeklyResetAt: string;
  sessionCountdown: string;
  weeklyCountdown: string;
}

export interface UsageState {
  sessionPct: number;
  weeklyPct: number;
  sessionResetAt: string;
  weeklyResetAt: string;
  sessionCountdown: string;
  weeklyCountdown: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshUsage: () => Promise<void>;
}

export interface ClaudeCredentials {
  claudeAiOauth: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface MonitorInfo {
  id: number;
  name: string;
  is_primary: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClaudeUsageResponse {
  five_hour: {
    utilization: number;
    resets_at: string;
  };
  seven_day: {
    utilization: number;
    resets_at: string;
  };
}
