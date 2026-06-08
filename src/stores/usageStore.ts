import { create } from 'zustand';
import { fetchUsage } from '../services/ClaudeUsageService';
import { formatCountdown } from '../utils/countdown';
import type { UsageState } from '../types';

export const useUsageStore = create<UsageState>()((set, get) => ({
  sessionPct: 0,
  weeklyPct: 0,
  sessionResetAt: '',
  weeklyResetAt: '',
  sessionCountdown: '--',
  weeklyCountdown: '--',
  isLoading: false,
  error: null,
  lastUpdated: null,
  dataSource: 'live',
  fetchedAt: 0,
  diagnostic: null,

  refreshUsage: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const data = await fetchUsage();
      // Cached fallback still resolves, but the numbers are stale. Surface the
      // real reason instead of silently showing old data.
      const stale = data.dataSource === 'cached';
      set({
        sessionPct: data.sessionUsage,
        weeklyPct: data.weeklyUsage,
        sessionResetAt: data.sessionResetAt,
        weeklyResetAt: data.weeklyResetAt,
        sessionCountdown: formatCountdown(data.sessionResetAt),
        weeklyCountdown: formatCountdown(data.weeklyResetAt),
        isLoading: false,
        lastUpdated: new Date(),
        dataSource: data.dataSource,
        fetchedAt: data.fetchedAt,
        diagnostic: data.diagnostic,
        error: stale ? (data.diagnostic ?? 'showing cached data') : null,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
        diagnostic: err instanceof Error ? err.message : String(err),
      });
    }
  },
}));

export function tickCountdowns() {
  const { sessionResetAt, weeklyResetAt } = useUsageStore.getState();
  const patch: Partial<UsageState> = {};
  if (sessionResetAt) patch.sessionCountdown = formatCountdown(sessionResetAt);
  if (weeklyResetAt)  patch.weeklyCountdown  = formatCountdown(weeklyResetAt);
  if (Object.keys(patch).length) useUsageStore.setState(patch);
}
