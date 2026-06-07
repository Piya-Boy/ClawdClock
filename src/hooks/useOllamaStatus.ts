import { useState, useEffect } from 'react';

export interface OllamaModel {
  name: string;
  size_vram: number;
}

export interface OllamaStatus {
  available: boolean;
  running: OllamaModel[];
}

const POLL_MS = 15_000;
const OLLAMA_PS_URL = 'http://localhost:11434/api/ps';

async function fetchOllamaStatus(): Promise<OllamaStatus> {
  const res = await fetch(OLLAMA_PS_URL, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) return { available: false, running: [] };
  const data = await res.json();
  const models: OllamaModel[] = (data.models ?? []).map((m: any) => ({
    name: m.name ?? m.model ?? 'unknown',
    size_vram: m.size_vram ?? 0,
  }));
  return { available: true, running: models };
}

export function useOllamaStatus() {
  const [status, setStatus] = useState<OllamaStatus>({ available: false, running: [] });

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const s = await fetchOllamaStatus();
        if (!cancelled) setStatus(s);
      } catch {
        if (!cancelled) setStatus({ available: false, running: [] });
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return status;
}
