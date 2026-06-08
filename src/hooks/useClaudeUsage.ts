import { useEffect } from 'react';
import { useUsageStore, tickCountdowns } from '../stores/usageStore';

// Usage windows are 5h / 7d — the numbers barely move minute-to-minute, so
// polling every 5 min is plenty. Polling faster (and across multiple machines
// on the same account) is what trips the API's shared 429 rate limit.
const REFRESH_INTERVAL_MS  = 300_000;
const COUNTDOWN_TICK_MS    = 30_000;
const LOADING_TIMEOUT_MS   = 15_000;

export function useClaudeUsage() {
  const { refreshUsage, isLoading, error, lastUpdated } = useUsageStore();

  useEffect(() => {
    refreshUsage();

    const refreshId = setInterval(() => {
      if (document.hidden) return; // window not shown — skip network fetch
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

    const countdownId = setInterval(() => {
      if (document.hidden) return;
      tickCountdowns();
    }, COUNTDOWN_TICK_MS);

    // Refresh immediately when window becomes visible (was hidden, now shown)
    const onVis = () => { if (!document.hidden) refreshUsage(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearInterval(refreshId);
      clearInterval(countdownId);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return { isLoading, error, lastUpdated };
}
