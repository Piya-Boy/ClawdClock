# ClawdClock Roadmap

> Fliqlo for AI Developers

ClawdClock is a premium desktop ambient display that combines a beautiful flip clock, Claude Code usage monitoring, and a distraction-free developer lock screen experience.

---

# Current Status

## Phase 0 - Prototype

### Completed

* [x] Main dashboard design
* [x] Flip clock UI
* [x] Session usage display
* [x] Weekly usage display
* [x] Pixel mascot
* [x] Live settings preview
* [x] HTML/CSS/JS prototype
* [x] Claude OAuth Usage API discovery
* [x] Usage API response validation

---

# Phase 1 - MVP

Target: First public release

## Core Dashboard

* [x] React component migration
* [x] FlipClock component
* [x] UsagePanel component
* [x] ProgressBar component
* [x] ClawdMascot component

## Clock Engine

* [x] Real-time clock
* [x] Use system time
* [x] Detect timezone automatically
* [x] 24-hour format
* [x] 12-hour format
* [x] Smooth digit updates

## Claude Usage API

* [x] Read OAuth credentials
* [x] Extract access token
* [x] Fetch usage from OAuth API
* [x] Parse usage response
* [x] Session usage display
* [x] Weekly usage display
* [x] Reset countdown
* [x] Auto refresh every 60 seconds
* [x] Offline cache
* [x] Last updated indicator

Implement Claude Usage API integration for ClawdClock.

Stack:

* Tauri 2
* React 19
* TypeScript
* Zustand

IMPORTANT

This feature will be the primary source of Claude Code usage data.

Do not use statusline scripts.
Do not use local usage cache files.

Use the Claude OAuth Usage API directly.

---

API SOURCE

Read OAuth credentials from:

Windows:
C:\Users<USER>\.claude\.credentials.json

macOS:
~/.claude/.credentials.json

Linux:
~/.claude/.credentials.json

Example:

{
"claudeAiOauth": {
"accessToken": "...",
"refreshToken": "..."
}
}

---

USAGE ENDPOINT

GET

https://api.anthropic.com/api/oauth/usage

Authorization:

Bearer <accessToken>

---

Example Response

{
"five_hour": {
"utilization": 24.0,
"resets_at": "2026-06-07T13:09:59.664756+00:00"
},
"seven_day": {
"utilization": 26.0,
"resets_at": "2026-06-08T17:00:00.664791+00:00"
}
}

---

Create

src/services/ClaudeUsageService.ts

Responsibilities:

* Read OAuth credentials
* Extract access token
* Call usage endpoint
* Parse response
* Handle failures
* Return normalized data

---

Normalized Output

{
sessionUsage: 24,
weeklyUsage: 26,

sessionResetAt: "...",
weeklyResetAt: "...",

sessionCountdown: "2h 14m",
weeklyCountdown: "1d 3h"
}

---

Create

src/stores/usageStore.ts

State:

sessionUsage
weeklyUsage

sessionResetAt
weeklyResetAt

sessionCountdown
weeklyCountdown

isLoading
error

lastUpdated

refreshUsage()

---

Auto Refresh

Refresh every 60 seconds.

Requirements:

* Refresh immediately on app start
* Refresh every minute
* Cleanup interval on unmount

---

Countdown

Convert:

2026-06-07T13:09:59.664756+00:00

Into:

2h 14m

Convert:

2026-06-08T17:00:00.664791+00:00

Into:

1d 3h

Update countdown every minute.

---

Usage Colors

Session and Weekly usage should automatically determine status:

0-69%

status = healthy
color = green

70-89%

status = warning
color = yellow

90-100%

status = critical
color = red

---

Offline Handling

If API fails:

* Keep previous values
* Show last updated timestamp
* Do not clear UI
* Do not crash

Example:

Last Updated
5 minutes ago

---

Security

Never expose:

accessToken
refreshToken

Never render credentials in UI.

Never log credentials.

---

UI Integration

UsagePanel should display:

SESSION (5H)

24%

RESETS IN 2h 14m

WEEKLY (7D)

26%

RESETS IN 1d 3h

Progress bars should animate smoothly.

---

Deliverables

1. ClaudeUsageService.ts
2. usageStore.ts
3. useClaudeUsage hook
4. countdown utility
5. TypeScript types
6. Error handling
7. Auto refresh implementation
8. Complete production-ready code

Before coding:

Analyze architecture first.

Generate file tree.

Explain implementation plan.

Then generate code.


## Settings

### Display

* [x] Activate After (Idle Timeout)
* [x] Preview Now
* [x] Fullscreen Preview

### Time

* [x] Use System Time
* [x] 24-Hour Format
* [x] 12-Hour Format

### Power

* [x] Computer Sleep
* [x] Launch at Startup (Windows)

### Lock Screen

* [x] Enable Lock Screen Mode
* [x] Exit on Mouse Movement
* [x] Exit on Keyboard Activity
* [ ] Password Required Mode

## Local Storage

* [x] Save settings
* [x] Load settings on startup

## Platform Support

* [x] Windows
* [ ] macOS
* [ ] Linux

---

# Phase 2 - Ambient Display

Target: Replace Fliqlo

## Idle Detection

* [x] Detect user inactivity
* [x] Launch automatically after idle
* [x] Configurable idle timeout

## Fullscreen Experience

* [x] Borderless mode
* [x] Fullscreen mode
* [x] Always-on-top mode
* [x] OLED optimized mode

## Exit Triggers

* [x] Mouse movement exits clock
* [x] Keyboard activity exits clock

## Multi Monitor

* [x] Detect monitors
* [x] Primary monitor mode
* [x] Selected monitor mode
* [x] All monitor mode

---

# Phase 3 - Lock Screen Mode

Target: Developer Ambient Lock Screen

## Lock Screen Experience

* [x] Fullscreen lock mode
* [x] Borderless lock mode
* [ ] Hide taskbar (future)
* [x] Focused window mode
* [x] Lock indicator UI

## Launch Triggers

* [x] Manual launch (Preview Now)
* [x] Idle launch
* [x] Global hotkey launch (Ctrl+Shift+L)

## Exit Triggers

* [x] Mouse movement (when not locked)
* [x] Keyboard activity (when not locked)
* [ ] Password required mode

## Security

* [ ] Optional unlock password
* [ ] Password prompt screen
* [x] Settings stored locally (Zustand persist)

---

# Phase 4 - Windows Screensaver

Target: Native Windows Integration

## SCR Support

* [x] Build .scr executable
* [ ] Preview mode (SetParent HWND embed — future)
* [x] Configuration mode
* [x] Fullscreen screensaver mode

## Windows Integration

* [x] Register as screensaver
* [x] Screen Saver Settings integration
* [x] Windows installer integration

---

# Phase 5 - Themes & Layouts

Target: Personalization

## Themes

* [x] Classic ClawdClock
* [x] OLED Black
* [x] Fliqlo Classic
* [x] Terminal Green
* [x] Retro Amber

## Layouts

* [x] Vertical layout
* [x] Horizontal layout
* [x] Compact layout
* [x] Minimal layout
* [x] Ultra Minimal layout

---

# Phase 6 - Multi Machine Sync

Target: Professional Setup

## Device Sync

* [ ] Home PC
* [ ] Work PC
* [ ] Laptop

## Cloud Sync

* [ ] Supabase integration
* [ ] Settings sync
* [ ] Usage sync
* [ ] Device management

---

# Phase 7 - Public Release

## Distribution

* [ ] Windows Installer
* [ ] Windows Screensaver Package
* [ ] macOS Package
* [ ] Linux AppImage

## Documentation

* [ ] Installation Guide
* [ ] User Guide
* [ ] FAQ

## Website

* [ ] Landing Page
* [ ] Download Page
* [ ] Screenshots
* [ ] Changelog

---

# Future Ideas

## Integrations

* [ ] GitHub Activity
* [ ] GitHub Contributions
* [ ] CI/CD Status
* [ ] Ollama Usage
* [ ] OpenAI Usage
* [ ] Gemini Usage

## Fun Features

* [ ] Animated Mascot
* [ ] DVD Bouncing Mascot
* [ ] Mascot Reactions
* [ ] Seasonal Themes
* [ ] Achievement System

---

# Tech Stack

## Frontend

* React 19
* TypeScript
* Vite
* CSS
* shadcn/ui
* Zustand

## Desktop

* Tauri 2

## Build & Release

* GitHub Actions
* Release Automation

---

# Vision

Create the best ambient display and lock screen experience for AI developers.

A beautiful clock.
A useful Claude Code monitor.
A premium desktop companion.
