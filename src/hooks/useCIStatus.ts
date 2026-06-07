import { useState, useEffect } from 'react';

export type CIRunStatus = 'success' | 'failure' | 'in_progress' | 'queued' | 'unknown';

export interface CIStatus {
  status: CIRunStatus;
  conclusion: string | null;
  runUrl: string | null;
  updatedAt: string | null;
}

const POLL_MS = 120_000; // 2 min
const CACHE_KEY = 'clawdclock-ci-status';
const CACHE_TTL_MS = 120_000;

async function fetchCIStatus(repo: string): Promise<CIStatus> {
  const url = `https://api.github.com/repos/${repo}/actions/runs?per_page=1&branch=main`;
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return { status: 'unknown', conclusion: null, runUrl: null, updatedAt: null };
  const data = await res.json();
  const run = data.workflow_runs?.[0];
  if (!run) return { status: 'unknown', conclusion: null, runUrl: null, updatedAt: null };

  let status: CIRunStatus = 'unknown';
  if (run.status === 'in_progress') status = 'in_progress';
  else if (run.status === 'queued') status = 'queued';
  else if (run.status === 'completed') {
    status = run.conclusion === 'success' ? 'success' : 'failure';
  }

  return {
    status,
    conclusion: run.conclusion ?? null,
    runUrl: run.html_url ?? null,
    updatedAt: run.updated_at ?? null,
  };
}

export function useCIStatus(repo: string | null) {
  const [ci, setCI] = useState<CIStatus>({ status: 'unknown', conclusion: null, runUrl: null, updatedAt: null });

  useEffect(() => {
    if (!repo) return;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL_MS) { setCI(data); }
      } catch {}
    }

    const poll = async () => {
      try {
        const data = await fetchCIStatus(repo);
        setCI(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      } catch {}
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [repo]);

  return ci;
}
