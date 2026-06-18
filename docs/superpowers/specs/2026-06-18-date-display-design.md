# Date Display Feature — Design Spec
_2026-06-18_

## Summary

Show date above the FlipClock (left column). User can choose format (short/long/none) and era (CE/BE). BE era uses Thai language; CE uses English.

## Formats

| Setting | Era | Example |
|---------|-----|---------|
| short | CE | `WED 18 JUN 26` |
| short | BE | `พ. 18 มิ.ย. 69` |
| long | CE | `WEDNESDAY, JUNE 18, 2026` |
| long | BE | `วันพุธ, 18 มิถุนายน 2569` |
| none | — | (hidden) |

- BE year = CE year + 543
- Short BE year = last 2 digits of BE year (e.g. 2569 → 69)
- Short CE year = last 2 digits of CE year (e.g. 2026 → 26)

## New Settings

| Key | Type | Default | Values |
|-----|------|---------|--------|
| `dateFormat` | `'none' \| 'short' \| 'long'` | `'none'` | none / short / long |
| `dateEra` | `'CE' \| 'BE'` | `'CE'` | CE / BE |

Both persisted in `clawdclock-settings` (zustand persist).

## Components

### `DateDisplay.tsx` (new)
- Pure component
- Props: `date: Date`, `format: 'short' | 'long'`, `era: 'CE' | 'BE'`, `theme: Theme`
- Renders formatted date string
- Font: Barlow, same weight/style as ampm label in FlipClock
- Uppercased for CE, natural case for BE

### `FlipClock.tsx` (modify)
- Add optional prop `dateNode?: React.ReactNode`
- Render `dateNode` above the digit rows when provided

### `ClawdClockView.tsx` (modify)
- Import `DateDisplay`
- Construct `<DateDisplay>` when `dateFormat !== 'none'`, pass as `dateNode` to `FlipClock`
- Props added: `dateFormat`, `dateEra`

### `App.tsx` (modify)
- Read `dateFormat`, `dateEra` from `useSettingsStore`
- Pass down to `ClawdClockView`

### `types/index.ts` (modify)
- Add `DateFormat = 'none' | 'short' | 'long'`
- Add `DateEra = 'CE' | 'BE'`
- Add to `SettingsState`: `dateFormat`, `dateEra`, `setDateFormat`, `setDateEra`

### `settingsStore.ts` (modify)
- Add `dateFormat: 'none'` default
- Add `dateEra: 'CE'` default
- Add setters with `setSync`
- Add to `SettingsValues` pick type

### Settings panel (modify)
- Add "Date Format" row: Dropdown with options None / Short / Long
- Add "Date Era" row: SegControl with CE / BE (hidden when dateFormat = 'none')

## Data Flow

```
useSettingsStore (dateFormat, dateEra)
  → App.tsx
    → ClawdClockView (props)
      → DateDisplay (constructs node)
        → FlipClock (renders above digits)
```

## Date Source

`useClock()` already returns `Date` (now). Pass same `now` through to `ClawdClockView` → `DateDisplay`. No new hook needed.

## Error Handling

None needed — date formatting is pure computation, no network or IO.
