import { invoke } from '@tauri-apps/api/core';
import { formatCountdown } from '../utils/countdown';
import type { UsageData } from '../types';

interface RawUsageResult {
  session_usage: number;
  weekly_usage: number;
  session_resets_at: string;
  weekly_resets_at: string;
}

export async function fetchUsage(): Promise<UsageData> {
  const raw = await invoke<RawUsageResult>('fetch_claude_usage');

  return {
    sessionUsage: Math.round(raw.session_usage),
    weeklyUsage: Math.round(raw.weekly_usage),
    sessionResetAt: raw.session_resets_at,
    weeklyResetAt: raw.weekly_resets_at,
    sessionCountdown: formatCountdown(raw.session_resets_at),
    weeklyCountdown: formatCountdown(raw.weekly_resets_at),
  };
}
