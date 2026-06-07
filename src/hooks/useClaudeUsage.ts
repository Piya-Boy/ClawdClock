import { useEffect } from 'react';
import { useUsageStore, tickCountdowns } from '../stores/usageStore';

const REFRESH_INTERVAL_MS = 60_000;
const COUNTDOWN_TICK_MS   = 60_000;

export function useClaudeUsage() {
  const { refreshUsage, isLoading, error, lastUpdated } = useUsageStore();

  useEffect(() => {
    refreshUsage();

    const refreshId  = setInterval(refreshUsage, REFRESH_INTERVAL_MS);
    const countdownId = setInterval(tickCountdowns, COUNTDOWN_TICK_MS);

    return () => {
      clearInterval(refreshId);
      clearInterval(countdownId);
    };
  }, []);

  return { isLoading, error, lastUpdated };
}
