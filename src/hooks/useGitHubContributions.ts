import { useState, useEffect } from 'react';

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const CACHE_KEY = 'clawdclock-gh-contrib';
const CACHE_TTL_MS = 1_800_000; // 30 min

interface Cache {
  ts: number;
  days: ContributionDay[];
  username: string;
}

async function fetchContributions(username: string): Promise<ContributionDay[]> {
  const url = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`contributions API ${res.status}`);
  const data = await res.json();
  const contributions: any[] = data.contributions ?? [];
  return contributions.map(c => ({
    date: c.date,
    count: c.count ?? 0,
    level: Math.min(4, c.level ?? 0) as 0 | 1 | 2 | 3 | 4,
  }));
}

export function useGitHubContributions(username: string | null) {
  const [days, setDays] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { ts, days: d, username: u }: Cache = JSON.parse(cached);
        if (u === username && Date.now() - ts < CACHE_TTL_MS) {
          setDays(d);
          return;
        }
      } catch {}
    }

    setLoading(true);
    fetchContributions(username)
      .then(d => {
        setDays(d);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), days: d, username }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  // last 30 days
  return { days: days.slice(-30), loading };
}
