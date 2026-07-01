import { useEffect } from 'react';
import { useUsageStore, tickCountdowns } from '../stores/usageStore';

// Usage windows are 5h / 7d — the numbers barely move minute-to-minute, so
// polling every 5 min is plenty. Polling faster (and across multiple machines
// on the same account) is what trips the API's shared 429 rate limit.
const REFRESH_INTERVAL_MS  = 300_000;
// Once a window's resets_at has passed, the % is stale until Anthropic's API
// catches up — poll faster during that gap so the reset shows up quickly
// instead of waiting up to 5 minutes for the next slow-poll cycle.
const FAST_REFRESH_INTERVAL_MS = 15_000;
const COUNTDOWN_TICK_MS    = 30_000;
const LOADING_TIMEOUT_MS   = 15_000;

export function useClaudeUsage() {
  const { refreshUsage, isLoading, error, lastUpdated } = useUsageStore();

  useEffect(() => {
    refreshUsage();

    let lastPoll = 0;
    const poll = () => {
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

      const now = Date.now();
      const { sessionResetAt, weeklyResetAt } = state;
      const stale =
        (sessionResetAt && new Date(sessionResetAt).getTime() <= now) ||
        (weeklyResetAt  && new Date(weeklyResetAt).getTime()  <= now);
      const interval = stale ? FAST_REFRESH_INTERVAL_MS : REFRESH_INTERVAL_MS;
      if (now - lastPoll < interval) return;

      lastPoll = now;
      refreshUsage();
    };

    const refreshId = setInterval(poll, FAST_REFRESH_INTERVAL_MS);

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
