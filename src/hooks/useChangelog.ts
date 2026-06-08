import { useState, useEffect } from 'react';
import { getVersion } from '@tauri-apps/api/app';

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
  appVersion: string;
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
    let cancelled = false;

    (async () => {
      const appVersion = await getVersion().catch(() => '');

      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { ts, appVersion: cachedVer, releases: r }: Cache = JSON.parse(cached);
          const fresh = Date.now() - ts < CACHE_TTL_MS;
          const sameVersion = cachedVer === appVersion;
          if (fresh && sameVersion) {
            if (!cancelled) setReleases(r);
            return;
          }
        } catch {}
        localStorage.removeItem(CACHE_KEY);
      }

      if (cancelled) return;
      setLoading(true);
      fetchReleases()
        .then(r => {
          if (cancelled) return;
          setReleases(r);
          const cache: Cache = { ts: Date.now(), appVersion, releases: r };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoading(false); });
    })();

    return () => { cancelled = true; };
  }, []);

  return { releases, loading };
}
