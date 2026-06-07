import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { SettingsApp } from './SettingsApp';

async function mount() {
  let label = 'clock';
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    label = getCurrentWindow().label;
  } catch {
    label = new URLSearchParams(window.location.search).get('window') ?? 'clock';
  }

  const Root = label === 'settings' ? SettingsApp : App;

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}

mount();
