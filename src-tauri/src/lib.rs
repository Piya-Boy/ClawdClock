use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
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

#[derive(Debug, Serialize)]
pub struct UsageResult {
    pub session_usage: f64,
    pub weekly_usage: f64,
    pub session_resets_at: String,
    pub weekly_resets_at: String,
}

#[tauri::command]
async fn fetch_claude_usage() -> Result<UsageResult, String> {
    let token = read_access_token()?;

    let client = reqwest::Client::builder()
        .user_agent("ClawdClock/0.1")
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get("https://api.anthropic.com/api/oauth/usage")
        .bearer_auth(&token)
        .send()
        .await
        .map_err(|e| format!("network error: {e}"))?;

    if !resp.status().is_success() {
        let status = resp.status().as_u16();
        let body = resp.text().await.unwrap_or_default();
        return Err(format!("API error {status}: {body}"));
    }

    let data: UsageResponse = resp.json().await
        .map_err(|e| format!("parse error: {e}"))?;

    Ok(UsageResult {
        session_usage: data.five_hour.utilization,
        weekly_usage: data.seven_day.utilization,
        session_resets_at: data.five_hour.resets_at,
        weekly_resets_at: data.seven_day.resets_at,
    })
}

/* ── Entry Point ────────────────────────────────────────────── */

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            open_settings_window,
            show_clock_window,
            hide_clock_window,
            fetch_claude_usage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
