use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri::window::Monitor;

#[derive(Debug, Clone, PartialEq)]
pub enum ScrMode {
    Screensaver,
    Preview(u64),
    Config,
}
use serde::{Deserialize, Serialize};
use std::fs;

/* ── App Settings ───────────────────────────────────────────── */

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub activate_after: String,
    pub sleep_after: String,
    pub time_format: String,
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            activate_after: "5 minutes".into(),
            sleep_after: "Never".into(),
            time_format: "24".into(),
        }
    }
}

fn settings_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    app.path().app_data_dir()
        .expect("no app data dir")
        .join("settings.json")
}

#[tauri::command]
fn get_settings(app: tauri::AppHandle) -> Settings {
    let path = settings_path(&app);
    if let Ok(data) = fs::read_to_string(&path) {
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        Settings::default()
    }
}

#[tauri::command]
fn save_settings(app: tauri::AppHandle, settings: Settings) -> Result<(), String> {
    let path = settings_path(&app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())
}

/* ── Window Management ──────────────────────────────────────── */

#[tauri::command]
fn open_settings_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("settings") {
        win.show().map_err(|e| e.to_string())?;
        win.set_focus().map_err(|e| e.to_string())?;
    } else {
        WebviewWindowBuilder::new(
            &app,
            "settings",
            WebviewUrl::App("index.html?window=settings".into()),
        )
        .title("ClawdClock Settings")
        .inner_size(900.0, 580.0)
        .resizable(false)
        .center()
        .decorations(false)
        .build()
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn show_clock_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("clock") {
        win.show().map_err(|e| e.to_string())?;
        win.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn hide_clock_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("clock") {
        win.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/* ── Claude OAuth Credentials ───────────────────────────────── */

#[derive(Debug, Serialize, Deserialize)]
struct OAuthCredentials {
    #[serde(rename = "claudeAiOauth")]
    claude_ai_oauth: OAuthTokens,
}

#[derive(Debug, Serialize, Deserialize)]
struct OAuthTokens {
    #[serde(rename = "accessToken")]
    access_token: String,
    #[serde(rename = "refreshToken")]
    refresh_token: String,
}

fn credentials_path() -> Option<std::path::PathBuf> {
    dirs::home_dir().map(|h| h.join(".claude").join(".credentials.json"))
}

fn read_access_token() -> Result<String, String> {
    let path = credentials_path().ok_or("cannot determine home dir")?;
    let data = fs::read_to_string(&path)
        .map_err(|_| "credentials not found — log in to Claude Code first".to_string())?;
    let creds: OAuthCredentials = serde_json::from_str(&data)
        .map_err(|e| format!("credentials parse error: {e}"))?;
    Ok(creds.claude_ai_oauth.access_token)
}

/* ── Claude Usage API ───────────────────────────────────────── */

#[derive(Debug, Serialize, Deserialize)]
struct UsageBucket {
    utilization: f64,
    resets_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct UsageResponse {
    five_hour: UsageBucket,
    seven_day: UsageBucket,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UsageResult {
    pub session_usage: f64,
    pub weekly_usage: f64,
    pub session_resets_at: String,
    pub weekly_resets_at: String,
}

fn usage_cache_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    app.path().app_data_dir()
        .expect("no app data dir")
        .join("usage_cache.json")
}

fn save_usage_cache(app: &tauri::AppHandle, result: &UsageResult) {
    let path = usage_cache_path(app);
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(data) = serde_json::to_string(result) {
        let _ = fs::write(path, data);
    }
}

fn load_usage_cache(app: &tauri::AppHandle) -> Option<UsageResult> {
    let path = usage_cache_path(app);
    let data = fs::read_to_string(path).ok()?;
    serde_json::from_str(&data).ok()
}

#[tauri::command]
async fn fetch_claude_usage(app: tauri::AppHandle) -> Result<UsageResult, String> {
    let token = match read_access_token() {
        Ok(t) => t,
        Err(e) => {
            return load_usage_cache(&app)
                .ok_or_else(|| e);
        }
    };

    let client = reqwest::Client::builder()
        .user_agent("ClawdClock/0.1")
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get("https://api.anthropic.com/api/oauth/usage")
        .bearer_auth(&token)
        .send()
        .await;

    let resp = match resp {
        Ok(r) => r,
        Err(e) => {
            return load_usage_cache(&app)
                .ok_or_else(|| format!("network error: {e}"));
        }
    };

    if !resp.status().is_success() {
        let status = resp.status().as_u16();
        let body = resp.text().await.unwrap_or_default();
        return load_usage_cache(&app)
            .ok_or_else(|| format!("API error {status}: {body}"));
    }

    let data: UsageResponse = resp.json().await
        .map_err(|e| format!("parse error: {e}"))?;

    let result = UsageResult {
        session_usage: data.five_hour.utilization,
        weekly_usage: data.seven_day.utilization,
        session_resets_at: data.five_hour.resets_at,
        weekly_resets_at: data.seven_day.resets_at,
    };

    save_usage_cache(&app, &result);
    Ok(result)
}

/* ── Idle Detection ─────────────────────────────────────────── */

#[tauri::command]
fn get_idle_seconds() -> u32 {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
        use windows_sys::Win32::System::SystemInformation::GetTickCount;
        unsafe {
            let mut lii = LASTINPUTINFO {
                cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
                dwTime: 0,
            };
            if GetLastInputInfo(&mut lii) != 0 {
                let elapsed = GetTickCount().wrapping_sub(lii.dwTime);
                return elapsed / 1000;
            }
        }
        0
    }
    #[cfg(not(target_os = "windows"))]
    0
}

/* ── Autostart ──────────────────────────────────────────────── */

#[tauri::command]
fn set_autostart(enable: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let exe_str = exe.to_string_lossy();
        if enable {
            Command::new("reg")
                .args(["add", r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                       "/v", "ClawdClock", "/t", "REG_SZ", "/d", &exe_str, "/f"])
                .output()
                .map_err(|e| e.to_string())?;
        } else {
            Command::new("reg")
                .args(["delete", r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                       "/v", "ClawdClock", "/f"])
                .output()
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = enable;
        Err("autostart not implemented on this platform".into())
    }
}

/* ── Lock Screen ────────────────────────────────────────────── */

#[tauri::command]
fn set_lock_screen(app: tauri::AppHandle, locked: bool) -> Result<(), String> {
    let win = app.get_webview_window("clock")
        .ok_or("clock window not found")?;
    win.set_always_on_top(locked).map_err(|e| e.to_string())?;
    Ok(())
}

/* ── Multi-Monitor ──────────────────────────────────────────── */

#[derive(Debug, Serialize, Clone)]
pub struct MonitorInfo {
    pub id: usize,
    pub name: String,
    pub is_primary: bool,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[tauri::command]
fn list_monitors(app: tauri::AppHandle) -> Vec<MonitorInfo> {
    let monitors: Vec<Monitor> = app.available_monitors().unwrap_or_default();
    let primary: Option<Monitor> = app.primary_monitor().ok().flatten();

    monitors.iter().enumerate().map(|(i, m)| {
        let is_primary = primary.as_ref()
            .map(|p| p.name() == m.name())
            .unwrap_or(false);
        MonitorInfo {
            id: i,
            name: m.name().map_or("Monitor", |v| v).to_string(),
            is_primary,
            x: m.position().x,
            y: m.position().y,
            width: m.size().width,
            height: m.size().height,
        }
    }).collect()
}

#[tauri::command]
fn show_clock_on_monitor(app: tauri::AppHandle, monitor_id: usize) -> Result<(), String> {
    let monitors: Vec<Monitor> = app.available_monitors().unwrap_or_default();

    let monitor = monitors.get(monitor_id)
        .ok_or_else(|| format!("monitor {monitor_id} not found"))?;

    let pos  = monitor.position();
    let size = monitor.size();

    let win = match app.get_webview_window("clock") {
        Some(w) => w,
        None => return Err("clock window not found".into()),
    };

    win.set_position(tauri::PhysicalPosition::new(pos.x, pos.y))
        .map_err(|e| e.to_string())?;
    win.set_size(tauri::PhysicalSize::new(size.width, size.height))
        .map_err(|e| e.to_string())?;
    win.show().map_err(|e| e.to_string())?;
    win.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn show_clock_on_all_monitors(app: tauri::AppHandle) -> Result<(), String> {
    let monitors: Vec<Monitor> = app.available_monitors().unwrap_or_default();
    if monitors.is_empty() {
        return Err("no monitors found".into());
    }

    // Show the main clock window on primary (first) monitor
    let primary = monitors.iter()
        .enumerate()
        .find(|(_, m)| {
            app.primary_monitor().ok().flatten()
                .map(|p| p.name() == m.name())
                .unwrap_or(false)
        })
        .map(|(i, _)| i)
        .unwrap_or(0);

    let win = app.get_webview_window("clock")
        .ok_or("clock window not found")?;
    let m = &monitors[primary];
    win.set_position(tauri::PhysicalPosition::new(m.position().x, m.position().y))
        .map_err(|e| e.to_string())?;
    win.set_size(tauri::PhysicalSize::new(m.size().width, m.size().height))
        .map_err(|e| e.to_string())?;
    win.show().map_err(|e| e.to_string())?;
    win.set_focus().map_err(|e| e.to_string())?;

    // Spawn/show extra windows for secondary monitors
    for (i, m) in monitors.iter().enumerate() {
        if i == primary { continue; }
        let label = format!("clock-ext-{i}");
        let pos  = m.position();
        let size = m.size();

        if let Some(existing) = app.get_webview_window(&label) {
            let _ = existing.set_position(tauri::PhysicalPosition::new(pos.x, pos.y));
            let _ = existing.set_size(tauri::PhysicalSize::new(size.width, size.height));
            let _ = existing.show();
        } else {
            let _ = WebviewWindowBuilder::new(
                &app,
                &label,
                tauri::WebviewUrl::App("index.html".into()),
            )
            .position(pos.x as f64, pos.y as f64)
            .inner_size(size.width as f64, size.height as f64)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .build();
        }
    }
    Ok(())
}

#[tauri::command]
fn hide_clock_all_monitors(app: tauri::AppHandle) -> Result<(), String> {
    // Hide main clock
    if let Some(win) = app.get_webview_window("clock") {
        let _ = win.hide();
    }
    // Hide any extension windows
    let monitors: Vec<Monitor> = app.available_monitors().unwrap_or_default();
    for i in 0..monitors.len() {
        let label = format!("clock-ext-{i}");
        if let Some(win) = app.get_webview_window(&label) {
            let _ = win.hide();
        }
    }
    Ok(())
}

/* ── Registry / Screensaver ─────────────────────────────────── */

#[tauri::command]
fn register_screensaver() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        let exe_str = exe.to_string_lossy().to_string();
        std::process::Command::new("reg")
            .args(["add", r"HKCU\Control Panel\Desktop",
                   "/v", "SCRNSAVE.EXE", "/t", "REG_SZ", "/d", &exe_str, "/f"])
            .output()
            .map_err(|e| e.to_string())?;
        std::process::Command::new("reg")
            .args(["add", r"HKCU\Control Panel\Desktop",
                   "/v", "ScreenSaveActive", "/t", "REG_SZ", "/d", "1", "/f"])
            .output()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/* ── Auto Update ────────────────────────────────────────────── */

#[derive(Debug, Serialize, Clone)]
pub struct UpdateInfo {
    pub version: String,
    pub body: Option<String>,
}

#[tauri::command]
async fn check_for_update(app: tauri::AppHandle) -> Result<Option<UpdateInfo>, String> {
    use tauri_plugin_updater::UpdaterExt;
    let updater = match app.updater() {
        Ok(u) => u,
        Err(_) => return Ok(None), // no signing key configured
    };
    match updater.check().await {
        Ok(Some(update)) => Ok(Some(UpdateInfo {
            version: update.version.clone(),
            body: update.body.clone(),
        })),
        Ok(None) => Ok(None),
        Err(_) => Ok(None), // network error, endpoint unreachable — silent fail
    }
}

#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_updater::UpdaterExt;
    let updater = app.updater().map_err(|e| e.to_string())?;
    if let Some(update) = updater.check().await.map_err(|e| e.to_string())? {
        update.download_and_install(|_, _| {}, || {})
            .await
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

/* ── Entry Point ────────────────────────────────────────────── */

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    run_with_mode(ScrMode::Config);
}

pub fn run_with_mode(mode: ScrMode) {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(move |app| {
            // Global hotkey only when not in screensaver/preview mode
            if mode == ScrMode::Config {
                use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
                let shortcut: Shortcut = "Ctrl+Shift+L".parse().expect("invalid shortcut");
                let app_handle = app.handle().clone();
                app.global_shortcut().on_shortcut(shortcut, move |_app, _sc, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Some(win) = app_handle.get_webview_window("clock") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                        }
                    }
                })?;
            }

            // Screensaver mode: show clock immediately on primary monitor
            if mode == ScrMode::Screensaver {
                if let Some(win) = app.get_webview_window("clock") {
                    // Position on primary monitor
                    if let Ok(Some(primary)) = app.primary_monitor() {
                        let pos  = primary.position();
                        let size = primary.size();
                        let _ = win.set_position(tauri::PhysicalPosition::new(pos.x, pos.y));
                        let _ = win.set_size(tauri::PhysicalSize::new(size.width, size.height));
                    }
                    let _ = win.show();
                    let _ = win.set_focus();
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            open_settings_window,
            show_clock_window,
            hide_clock_window,
            fetch_claude_usage,
            get_idle_seconds,
            set_autostart,
            list_monitors,
            show_clock_on_monitor,
            show_clock_on_all_monitors,
            hide_clock_all_monitors,
            set_lock_screen,
            register_screensaver,
            check_for_update,
            install_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
