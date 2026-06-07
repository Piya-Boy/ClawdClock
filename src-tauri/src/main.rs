// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let mode = parse_scr_mode(&args);
    clawdclock_lib::run_with_mode(mode);
}

fn parse_scr_mode(args: &[String]) -> clawdclock_lib::ScrMode {
    for (i, arg) in args.iter().enumerate() {
        let a = arg.to_lowercase();
        let a = a.trim_start_matches('-');
        if a == "s" || a.starts_with("s:") {
            return clawdclock_lib::ScrMode::Screensaver;
        }
        if a == "p" {
            let hwnd = args.get(i + 1)
                .and_then(|v| v.parse::<u64>().ok())
                .unwrap_or(0);
            return clawdclock_lib::ScrMode::Preview(hwnd);
        }
        if a.starts_with("p:") {
            let hwnd = a.trim_start_matches("p:").parse::<u64>().unwrap_or(0);
            return clawdclock_lib::ScrMode::Preview(hwnd);
        }
        if a == "c" || a.starts_with("c:") {
            return clawdclock_lib::ScrMode::Config;
        }
    }
    clawdclock_lib::ScrMode::Config
}
