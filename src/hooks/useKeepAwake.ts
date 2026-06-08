import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

/**
 * Holds the display + system awake while the clock window is actually visible,
 * so Windows' idle timer can't drop the lock screen / sleep the monitor on top
 * of the running clock. Releases the hold whenever the window is hidden.
 *
 * Tracks visibility via `document.hidden` (set when the clock window is
 * `hide()`-n) so the hold tracks the *shown* state, not just mount/unmount —
 * the webview stays mounted across show/hide cycles.
 */
// Re-assert the hold periodically. SetThreadExecutionState's ES_CONTINUOUS
// flag is bound to the calling thread; Tauri may service the command on a
// transient worker thread, so a single call could be undone when that thread
// retires. Re-asserting on an interval keeps the hold alive regardless.
const REASSERT_MS = 50_000;

export function useKeepAwake() {
  useEffect(() => {
    const apply = () => {
      invoke('set_keep_awake', { on: !document.hidden }).catch(() => {});
    };

    apply(); // sync to current visibility on mount
    document.addEventListener('visibilitychange', apply);
    const id = setInterval(apply, REASSERT_MS);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', apply);
      invoke('set_keep_awake', { on: false }).catch(() => {}); // release on unmount
    };
  }, []);
}
