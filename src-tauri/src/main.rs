// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clawdclock_lib::ScrMode;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let mode = clawdclock_lib::mode_from_args(&args);

    // Preview mode (/p <hwnd>): Windows Screen Saver Settings dialog hands us a
    // child HWND to draw into. Launching the full Tauri app here freezes the
    // dialog, so paint a lightweight GDI frame and idle until the parent dies.
    #[cfg(target_os = "windows")]
    if let ScrMode::Preview(hwnd) = mode {
        run_preview(hwnd);
        return;
    }

    clawdclock_lib::run_with_mode(mode);
}

/// Paint a static preview frame into the dialog-supplied child window and block
/// until that window is destroyed (the dialog closes or selection changes).
#[cfg(target_os = "windows")]
fn run_preview(hwnd: u64) {
    use windows_sys::Win32::Foundation::{HWND, RECT};
    use windows_sys::Win32::Graphics::Gdi::{
        BeginPaint, CreateFontW, CreateSolidBrush, DeleteObject, DrawTextW, EndPaint, FillRect,
        InvalidateRect, SelectObject, SetBkMode, SetTextColor, PAINTSTRUCT, DT_CENTER, DT_SINGLELINE,
        DT_VCENTER, TRANSPARENT, FW_BOLD, DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS,
        DEFAULT_QUALITY, DEFAULT_PITCH,
    };
    use windows_sys::Win32::UI::WindowsAndMessaging::{GetClientRect, IsWindow};

    let hwnd = hwnd as HWND;
    if hwnd.is_null() {
        return;
    }

    unsafe {
        let mut rect: RECT = std::mem::zeroed();
        loop {
            // Parent gone → dialog closed; exit cleanly.
            if IsWindow(hwnd) == 0 {
                break;
            }

            if GetClientRect(hwnd, &mut rect) != 0 {
                let mut ps: PAINTSTRUCT = std::mem::zeroed();
                InvalidateRect(hwnd, std::ptr::null(), 0);
                let hdc = BeginPaint(hwnd, &mut ps);
                if !hdc.is_null() {
                    // Background
                    let bg = CreateSolidBrush(0x00000000); // black (BGR)
                    FillRect(hdc, &rect, bg);
                    DeleteObject(bg as _);

                    // Centered label
                    let h = rect.bottom - rect.top;
                    let font = CreateFontW(
                        (h as f32 * 0.22) as i32, 0, 0, 0,
                        FW_BOLD as i32, 0, 0, 0,
                        DEFAULT_CHARSET as u32, OUT_DEFAULT_PRECIS as u32, CLIP_DEFAULT_PRECIS as u32,
                        DEFAULT_QUALITY as u32, DEFAULT_PITCH as u32,
                        std::ptr::null(),
                    );
                    let old = SelectObject(hdc, font as _);
                    SetBkMode(hdc, TRANSPARENT as i32);
                    SetTextColor(hdc, 0x00B57341); // ClawdClock-ish accent (BGR)

                    let mut text: Vec<u16> = "ClawdClock".encode_utf16().collect();
                    text.push(0);
                    DrawTextW(
                        hdc, text.as_ptr(), -1, &mut rect,
                        DT_CENTER | DT_VCENTER | DT_SINGLELINE,
                    );

                    SelectObject(hdc, old);
                    DeleteObject(font as _);
                    EndPaint(hwnd, &ps);
                }
            }

            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    }
}
