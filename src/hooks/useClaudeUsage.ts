import { useEffect } from 'react';
import { useUsageStore, tickCountdowns } from '../stores/usageStore';

const REFRESH_INTERVAL_MS  = 60_000;
const COUNTDOWN_TICK_MS    = 30_000;
const LOADING_TIMEOUT_MS   = 15_000;

export function useClaudeUsage() {
  const { refreshUsage, isLoading, error, lastUpdated } = useUsageStore();

  useEffect(() => {
    refreshUsage();

    const refreshId = setInterval(() => {
      // Unstick isLoading if a request hung for >15s
      const state = useUsageStore.getState();
      if (state.isLoading) {
        const sinceUpdate = state.lastUpdated
          ? Date.now() - state.lastUpdated.getTime()
          : Infinity;
        if (sinceUpdate > LOADING_TIMEOUT_MS) {
          useUsageStore.setState({ isLoading: false });
        }
        return;
      }
      refreshUsage();
    }, REFRESH_INTERVAL_MS);

    const countdownId = setInterval(tickCountdowns, COUNTDOWN_TICK_MS);

    return () => {
      clearInterval(refreshId);
      clearInterval(countdownId);
    };
  }, []);

  return { isLoading, error, lastUpdated };
}
