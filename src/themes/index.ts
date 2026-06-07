export type ThemeId =
  | 'classic'
  | 'oled'
  | 'fliqlo'
  | 'terminal'
  | 'amber'
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter';


export interface Theme {
  id: ThemeId;
  name: string;
  // backgrounds
  bg: string;           // outermost bg (fullscreen clock)
  cardTop: string;      // flip digit upper half
  cardBot: string;      // flip digit lower half
  fold: string;         // fold line + notch color
  divider: string;      // hr between sections
  // text
  digitColor: string;   // digit top text
  digitColorBot: string;// digit bottom text (slightly dimmer)
  labelColor: string;   // "SESSION (5H)" label
  resetColor: string;   // "RESETS IN" label
  headerColor: string;  // "CLAUDE CODE" header
  offlineColor: string; // OFFLINE / UPDATED indicator dim
  // accent
  accent: string;       // brand orange (or equivalent)
  // usage status colors
  healthy: string;
  warning: string;
  critical: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  classic: {
    id: 'classic',
    name: 'Classic ClawdClock',
    bg: '#000000',
    cardTop: '#121212',
    cardBot: '#0b0b0b',
    fold: '#000000',
    divider: '#1c1c1c',
    digitColor: '#ffffff',
    digitColorBot: '#c0c0c0',
    labelColor: '#4e4e4e',
    resetColor: '#383838',
    headerColor: '#FF6B3D',
    offlineColor: '#2a2a2a',
    accent: '#FF6B3D',
    healthy: '#66CC44',
    warning: '#FFB800',
    critical: '#FF4444',
  },
  oled: {
    id: 'oled',
    name: 'OLED Black',
    bg: '#000000',
    cardTop: '#080808',
    cardBot: '#030303',
    fold: '#000000',
    divider: '#0f0f0f',
    digitColor: '#eeeeee',
    digitColorBot: '#888888',
    labelColor: '#333333',
    resetColor: '#2a2a2a',
    headerColor: '#ffffff',
    offlineColor: '#222222',
    accent: '#ffffff',
    healthy: '#44bb33',
    warning: '#ddaa00',
    critical: '#ee3333',
  },
  fliqlo: {
    id: 'fliqlo',
    name: 'Fliqlo Classic',
    bg: '#000000',
    cardTop: '#1a1a1a',
    cardBot: '#111111',
    fold: '#000000',
    divider: '#222222',
    digitColor: '#ffffff',
    digitColorBot: '#bbbbbb',
    labelColor: '#555555',
    resetColor: '#444444',
    headerColor: '#ffffff',
    offlineColor: '#333333',
    accent: '#ffffff',
    healthy: '#aaaaaa',
    warning: '#aaaaaa',
    critical: '#aaaaaa',
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal Green',
    bg: '#000000',
    cardTop: '#001a00',
    cardBot: '#000f00',
    fold: '#000000',
    divider: '#001500',
    digitColor: '#00ff41',
    digitColorBot: '#00aa2b',
    labelColor: '#004d00',
    resetColor: '#003a00',
    headerColor: '#00ff41',
    offlineColor: '#002200',
    accent: '#00ff41',
    healthy: '#00ff41',
    warning: '#aaff00',
    critical: '#ff4400',
  },
  amber: {
    id: 'amber',
    name: 'Retro Amber',
    bg: '#0a0500',
    cardTop: '#1a0e00',
    cardBot: '#110900',
    fold: '#0a0500',
    divider: '#1c1000',
    digitColor: '#ffb300',
    digitColorBot: '#cc8800',
    labelColor: '#5a3a00',
    resetColor: '#4a3000',
    headerColor: '#ffb300',
    offlineColor: '#3a2500',
    accent: '#ffb300',
    healthy: '#ffb300',
    warning: '#ff8c00',
    critical: '#ff3300',
  },
  spring: {
    id: 'spring',
    name: 'Spring Blossom',
    bg: '#050108',
    cardTop: '#130a18',
    cardBot: '#0d0612',
    fold: '#050108',
    divider: '#1a0d22',
    digitColor: '#f9a8d4',
    digitColorBot: '#e879b0',
    labelColor: '#4a1a40',
    resetColor: '#3a1230',
    headerColor: '#f472b6',
    offlineColor: '#2a0a1e',
    accent: '#f472b6',
    healthy: '#86efac',
    warning: '#fde68a',
    critical: '#f87171',
  },
  summer: {
    id: 'summer',
    name: 'Summer Neon',
    bg: '#000a10',
    cardTop: '#001828',
    cardBot: '#00101c',
    fold: '#000a10',
    divider: '#00202e',
    digitColor: '#22d3ee',
    digitColorBot: '#0ea5e9',
    labelColor: '#004455',
    resetColor: '#003344',
    headerColor: '#06b6d4',
    offlineColor: '#002233',
    accent: '#06b6d4',
    healthy: '#34d399',
    warning: '#fbbf24',
    critical: '#f87171',
  },
  autumn: {
    id: 'autumn',
    name: 'Autumn Ember',
    bg: '#080200',
    cardTop: '#1c0a00',
    cardBot: '#140700',
    fold: '#080200',
    divider: '#220c00',
    digitColor: '#fb923c',
    digitColorBot: '#ea580c',
    labelColor: '#4a1a00',
    resetColor: '#3a1200',
    headerColor: '#f97316',
    offlineColor: '#280e00',
    accent: '#f97316',
    healthy: '#a3e635',
    warning: '#fbbf24',
    critical: '#ef4444',
  },
  winter: {
    id: 'winter',
    name: 'Winter Ice',
    bg: '#000408',
    cardTop: '#070e18',
    cardBot: '#040a12',
    fold: '#000408',
    divider: '#0a1220',
    digitColor: '#bae6fd',
    digitColorBot: '#7dd3fc',
    labelColor: '#1e3a50',
    resetColor: '#152c3d',
    headerColor: '#7dd3fc',
    offlineColor: '#0a1e2e',
    accent: '#38bdf8',
    healthy: '#34d399',
    warning: '#fbbf24',
    critical: '#f87171',
  },
};

export const THEME_ORDER: ThemeId[] = ['classic', 'oled', 'fliqlo', 'terminal', 'amber', 'spring', 'summer', 'autumn', 'winter'];

export function getSeasonalTheme(): ThemeId {
  const m = new Date().getMonth(); // 0-11
  if (m >= 2 && m <= 4) return 'spring';   // Mar-May
  if (m >= 5 && m <= 7) return 'summer';   // Jun-Aug
  if (m >= 8 && m <= 10) return 'autumn';  // Sep-Nov
  return 'winter';                          // Dec-Feb
}

export function getTheme(id: ThemeId): Theme {
  return THEMES[id] ?? THEMES.classic;
}
