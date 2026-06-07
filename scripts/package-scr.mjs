// Copy the built .exe as a .scr file for Windows Screensaver installation.
// Run after: npm run tauri build
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const exePath  = resolve(root, 'src-tauri', 'target', 'release', 'clawdclock.exe');
const scrDir   = resolve(root, 'dist-scr');
const scrPath  = resolve(scrDir, 'ClawdClock.scr');

if (!existsSync(exePath)) {
  console.error(`Build output not found: ${exePath}`);
  console.error('Run "npm run tauri build" first.');
  process.exit(1);
}

mkdirSync(scrDir, { recursive: true });
copyFileSync(exePath, scrPath);
console.log(`Created: ${scrPath}`);
console.log('Install: Right-click ClawdClock.scr → Install');
