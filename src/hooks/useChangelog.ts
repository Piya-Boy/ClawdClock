import { useState, useEffect } from 'react';

export interface Release {
  version: string;
  name: string;
  body: string;
  publishedAt: string;
  url: string;
}

const RELEASES_URL = 'https://api.github.com/repos/Piya-Boy/ClawdClock/releases?per_page=5';
const CACHE_KEY = 'clawdclock-changelog-cache';
const CACHE_TTL_MS = 3_600_000; // 1 hour

interface Cache {
  ts: number;
  releases: Release[];
}

async function fetchReleases(): Promise<Release[]> {
  const res = await fetch(RELEASES_URL, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const data = await res.json();
  return (data as any[]).map(r => ({
    version: r.tag_name?.replace(/^v/, '') ?? '',
    name: r.name ?? r.tag_name ?? '',
    body: r.body ?? '',
    publishedAt: r.published_at ?? '',
    url: r.html_url ?? '',
  }));
}

export function useChangelog() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { ts, releases: r }: Cache = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL_MS) {
          setReleases(r);
          return;
        }
      } catch {}
    }

    setLoading(true);
    fetchReleases()
      .then(r => {
        setReleases(r);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), releases: r }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { releases, loading };
}
