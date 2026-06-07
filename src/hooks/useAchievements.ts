import { useState, useEffect, useRef } from 'react';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlockedAt: string | null;
}

const STORAGE_KEY = 'clawdclock-achievements';

const DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_load',       title: 'Hello, World',      desc: 'Open ClawdClock for the first time' },
  { id: 'usage_50',         title: 'Half Way',           desc: 'Reach 50% session usage' },
  { id: 'usage_90',         title: 'In The Zone',        desc: 'Reach 90% session usage' },
  { id: 'usage_100',        title: 'Limit Reached',      desc: 'Hit 100% session usage' },
  { id: 'weekly_50',        title: 'Weekly Grinder',     desc: 'Reach 50% weekly usage' },
  { id: 'weekly_90',        title: 'Power User',         desc: 'Reach 90% weekly usage' },
  { id: 'lock_screen',      title: 'Locked In',          desc: 'Use Lock Screen Mode' },
  { id: 'oled_mode',        title: 'Dark Arts',          desc: 'Enable OLED Mode' },
  { id: 'theme_changed',    title: 'Make It Yours',      desc: 'Change the clock theme' },
];

function load(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}

function save(unlocked: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
}

export function useAchievements(params: {
  sessionPct: number;
  weeklyPct: number;
  lockScreenEnabled: boolean;
  oledMode: boolean;
  themeChanged: boolean;
}) {
  const [unlocked, setUnlocked] = useState<Record<string, string>>(load);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unlock = (id: string) => {
    setUnlocked(prev => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: new Date().toISOString() };
      save(next);
      const def = DEFINITIONS.find(d => d.id === id);
      if (def) {
        setNewlyUnlocked({ ...def, unlockedAt: next[id] });
        if (notifTimer.current) clearTimeout(notifTimer.current);
        notifTimer.current = setTimeout(() => setNewlyUnlocked(null), 4000);
      }
      return next;
    });
  };

  // first_load — on mount
  useEffect(() => { unlock('first_load'); }, []);

  useEffect(() => {
    if (params.sessionPct >= 50)  unlock('usage_50');
    if (params.sessionPct >= 90)  unlock('usage_90');
    if (params.sessionPct >= 100) unlock('usage_100');
    if (params.weeklyPct  >= 50)  unlock('weekly_50');
    if (params.weeklyPct  >= 90)  unlock('weekly_90');
    if (params.lockScreenEnabled) unlock('lock_screen');
    if (params.oledMode)          unlock('oled_mode');
    if (params.themeChanged)      unlock('theme_changed');
  }, [params.sessionPct, params.weeklyPct, params.lockScreenEnabled, params.oledMode,
      params.themeChanged]);

  const all: Achievement[] = DEFINITIONS.map(d => ({
    ...d,
    unlockedAt: unlocked[d.id] ?? null,
  }));

  return { all, newlyUnlocked };
}
