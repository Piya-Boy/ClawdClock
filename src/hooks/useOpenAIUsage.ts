import { useState, useEffect } from 'react';

export interface OpenAIUsage {
  totalTokens: number;
  totalRequests: number;
  available: boolean;
}

const POLL_MS = 60_000;
const CACHE_KEY = 'clawdclock-openai-usage';
const CACHE_TTL_MS = 60_000;

async function fetchOpenAIUsage(apiKey: string): Promise<OpenAIUsage> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const url = `https://api.openai.com/v1/usage?date=${dateStr}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`OpenAI usage API ${res.status}`);
  const data = await res.json();
  const items: any[] = data.data ?? [];
  const totalTokens = items.reduce((s: number, d: any) => s + (d.n_context_tokens_total ?? 0) + (d.n_generated_tokens_total ?? 0), 0);
  const totalRequests = items.reduce((s: number, d: any) => s + (d.n_requests ?? 0), 0);
  return { totalTokens, totalRequests, available: true };
}

export function useOpenAIUsage(apiKey: string | null) {
  const [usage, setUsage] = useState<OpenAIUsage>({ totalTokens: 0, totalRequests: 0, available: false });

  useEffect(() => {
    if (!apiKey) return;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL_MS) { setUsage(data); }
      } catch {}
    }

    const poll = async () => {
      try {
        const data = await fetchOpenAIUsage(apiKey);
        setUsage(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      } catch {
        setUsage(u => ({ ...u, available: false }));
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [apiKey]);

  return usage;
}
