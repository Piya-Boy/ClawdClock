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

  refreshUsage: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const data = await fetchUsage();
      set({
        sessionPct: data.sessionUsage,
        weeklyPct: data.weeklyUsage,
        sessionResetAt: data.sessionResetAt,
        weeklyResetAt: data.weeklyResetAt,
        sessionCountdown: data.sessionCountdown,
        weeklyCountdown: data.weeklyCountdown,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
}));

export function tickCountdowns() {
  const { sessionResetAt, weeklyResetAt } = useUsageStore.getState();
  if (sessionResetAt && weeklyResetAt) {
    useUsageStore.setState({
      sessionCountdown: formatCountdown(sessionResetAt),
      weeklyCountdown: formatCountdown(weeklyResetAt),
    });
  }
}
