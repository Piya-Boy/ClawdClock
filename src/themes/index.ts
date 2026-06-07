export type ThemeId =
  | 'classic'
  | 'oled'
  | 'fliqlo'
  | 'terminal'
  | 'amber';


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
};

export const THEME_ORDER: ThemeId[] = ['classic', 'oled', 'fliqlo', 'terminal', 'amber'];

export function getTheme(id: ThemeId): Theme {
  return THEMES[id] ?? THEMES.classic;
}
