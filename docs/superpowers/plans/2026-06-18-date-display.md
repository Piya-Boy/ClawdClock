# Date Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show formatted date above the FlipClock with user-selectable format (none/short/long) and era (CE/BE).

**Architecture:** Add `DateFormat` and `DateEra` types + settings, create pure `DateDisplay` component, wire through `ClawdClockView` → `FlipClock` as a slot, add two Setting rows in `SettingsApp`.

**Tech Stack:** React 19, TypeScript, Zustand persist, Barlow font (already loaded)

## Global Constraints

- Font: `'Barlow','Helvetica Neue',Helvetica,sans-serif` — match existing FF constant
- No new dependencies
- BE year = CE year + 543; short year = last 2 digits
- BE era → Thai language strings; CE era → English uppercase
- `dateFormat` default: `'none'` (backward compat — existing users see no change)
- `dateEra` default: `'CE'`
- No `Co-Authored-By` in commit messages

---

### Task 1: Types + Settings Store

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/stores/settingsStore.ts`

**Interfaces:**
- Produces:
  - `type DateFormat = 'none' | 'short' | 'long'`
  - `type DateEra = 'CE' | 'BE'`
  - `SettingsState.dateFormat: DateFormat`
  - `SettingsState.dateEra: DateEra`
  - `SettingsState.setDateFormat: (v: DateFormat) => void`
  - `SettingsState.setDateEra: (v: DateEra) => void`

- [ ] **Step 1: Add types to `src/types/index.ts`**

After the `TimeFormat` line, add:
```typescript
export type DateFormat = 'none' | 'short' | 'long';
export type DateEra = 'CE' | 'BE';
```

Add to `SettingsState` interface (after `clockHotkey: string;`):
```typescript
  dateFormat: DateFormat;
  dateEra: DateEra;
  setDateFormat: (v: DateFormat) => void;
  setDateEra: (v: DateEra) => void;
```

- [ ] **Step 2: Update `SettingsValues` pick type in `src/stores/settingsStore.ts`**

Change:
```typescript
type SettingsValues = Pick<
  SettingsState,
  'activateAfter' | 'sleepAfter' | 'timeFormat' | 'theme' | 'oledMode'
  | 'launchAtStartup' | 'selectedMonitor' | 'lockScreenEnabled' | 'autoUpdate' | 'clockHotkey'
>;
```
To:
```typescript
type SettingsValues = Pick<
  SettingsState,
  'activateAfter' | 'sleepAfter' | 'timeFormat' | 'theme' | 'oledMode'
  | 'launchAtStartup' | 'selectedMonitor' | 'lockScreenEnabled' | 'autoUpdate' | 'clockHotkey'
  | 'dateFormat' | 'dateEra'
>;
```

- [ ] **Step 3: Add defaults and setters to store**

Add import for new types at top of `src/stores/settingsStore.ts`:
```typescript
import type { SettingsState, ActivateAfterOption, SleepAfterOption, TimeFormat, DateFormat, DateEra } from '../types';
```

In the `return { ... }` object, after `clockHotkey: 'Ctrl+Shift+L',` add:
```typescript
        dateFormat: 'none' as DateFormat,
        dateEra: 'CE' as DateEra,
```

After `setClockHotkey: (v: string) => setSync({ clockHotkey: v }),` add:
```typescript
        setDateFormat: (v: DateFormat) => setSync({ dateFormat: v }),
        setDateEra: (v: DateEra) => setSync({ dateEra: v }),
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -30`
Expected: no type errors related to `dateFormat` or `dateEra`

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/stores/settingsStore.ts
git commit -m "feat(date): add DateFormat/DateEra types and settings store fields"
```

---

### Task 2: DateDisplay Component

**Files:**
- Create: `src/components/FlipClock/DateDisplay.tsx`

**Interfaces:**
- Consumes: `type DateFormat` from `src/types/index.ts`, `type DateEra` from `src/types/index.ts`, `type Theme` from `src/themes/index.ts`
- Produces: `<DateDisplay date={Date} format={'short'|'long'} era={'CE'|'BE'} theme={Theme} />`

- [ ] **Step 1: Create `src/components/FlipClock/DateDisplay.tsx`**

```typescript
import type { Theme } from '../../themes';
import type { DateFormat, DateEra } from '../../types';

const FF = "'Barlow','Helvetica Neue',Helvetica,sans-serif";

const CE_DAYS_SHORT  = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const CE_DAYS_LONG   = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const CE_MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const CE_MONTHS_LONG  = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

const BE_DAYS_SHORT  = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
const BE_DAYS_LONG   = ['วันอาทิตย์','วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์','วันเสาร์'];
const BE_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const BE_MONTHS_LONG  = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function formatDate(date: Date, format: 'short' | 'long', era: DateEra): string {
  const d = date.getDay();
  const day = date.getDate();
  const month = date.getMonth();
  const ceYear = date.getFullYear();
  const beYear = ceYear + 543;

  if (era === 'CE') {
    const shortYear = String(ceYear).slice(-2);
    const longYear = String(ceYear);
    if (format === 'short') {
      return `${CE_DAYS_SHORT[d]} ${day} ${CE_MONTHS_SHORT[month]} ${shortYear}`;
    }
    return `${CE_DAYS_LONG[d]}, ${CE_MONTHS_LONG[month]} ${day}, ${longYear}`;
  } else {
    const shortYear = String(beYear).slice(-2);
    const longYear = String(beYear);
    if (format === 'short') {
      return `${BE_DAYS_SHORT[d]} ${day} ${BE_MONTHS_SHORT[month]} ${shortYear}`;
    }
    return `${BE_DAYS_LONG[d]}, ${day} ${BE_MONTHS_LONG[month]} ${longYear}`;
  }
}

interface Props {
  date: Date;
  format: 'short' | 'long';
  era: DateEra;
  theme: Theme;
}

export function DateDisplay({ date, format, era, theme }: Props) {
  const text = formatDate(date, format, era);
  return (
    <div style={{
      fontSize: format === 'short' ? 26 : 20,
      fontWeight: 700,
      color: theme.digitColorBot,
      fontFamily: FF,
      letterSpacing: format === 'short' ? '0.10em' : '0.06em',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      marginBottom: 12,
    }}>
      {text}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -30`
Expected: no errors in `DateDisplay.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/components/FlipClock/DateDisplay.tsx
git commit -m "feat(date): add DateDisplay component with CE/BE formatting"
```

---

### Task 3: Wire DateDisplay into FlipClock + ClawdClockView

**Files:**
- Modify: `src/components/FlipClock/FlipClock.tsx`
- Modify: `src/components/ClawdClockView/ClawdClockView.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `<DateDisplay>` from Task 2, `DateFormat`/`DateEra` from Task 1
- Produces: `FlipClock` accepts `dateNode?: React.ReactNode`; `ClawdClockView` accepts `dateFormat: DateFormat`, `dateEra: DateEra`, `now: Date`

- [ ] **Step 1: Add `dateNode` prop to `FlipClock`**

In `src/components/FlipClock/FlipClock.tsx`, update interface and component:
```typescript
import type { Theme } from '../../themes';

interface Props {
  hours: number;
  minutes: number;
  theme: Theme;
  ampm?: string;
  dateNode?: React.ReactNode;
}

export function FlipClock({ hours, minutes, theme, ampm, dateNode }: Props) {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {dateNode}
      <div style={{ display: 'flex', gap: 12 }}>
        <FlipDigit value={h[0]} theme={theme} />
        <FlipDigit value={h[1]} theme={theme} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <FlipDigit value={m[0]} theme={theme} />
        <FlipDigit value={m[1]} theme={theme} />
      </div>
      {ampm && (
        <div style={{
          fontSize: 28, fontWeight: 700,
          color: theme.digitColorBot, fontFamily: "'Barlow','Helvetica Neue',Helvetica,sans-serif",
          letterSpacing: '0.12em', marginTop: 4, alignSelf: 'flex-end',
        }}>
          {ampm}
        </div>
      )}
    </div>
  );
}
```

Note: add `import React from 'react';` at the top if not already present (needed for `React.ReactNode` type).

- [ ] **Step 2: Update `ClawdClockView` props and render**

In `src/components/ClawdClockView/ClawdClockView.tsx`:

Add imports at top:
```typescript
import { DateDisplay } from '../FlipClock/DateDisplay';
import type { DateFormat, DateEra } from '../../types';
```

Add to `Props` interface (after `error: string | null;`):
```typescript
  now: Date;
  dateFormat: DateFormat;
  dateEra: DateEra;
```

Add `now`, `dateFormat`, `dateEra` to destructure in function signature.

Replace the `<FlipClock ... />` call with:
```typescript
        <FlipClock
          hours={displayH}
          minutes={minutes}
          theme={theme}
          ampm={ampm}
          dateNode={
            dateFormat !== 'none'
              ? <DateDisplay date={now} format={dateFormat} era={dateEra} theme={theme} />
              : undefined
          }
        />
```

- [ ] **Step 3: Update `App.tsx`**

Add to destructure from `useSettingsStore`:
```typescript
  const { lockScreenEnabled, theme: themeId, oledMode, timeFormat, dateFormat, dateEra } = useSettingsStore();
```

Pass new props to `<ClawdClockView>`:
```typescript
          now={now}
          dateFormat={dateFormat}
          dateEra={dateEra}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -30`
Expected: no type errors

- [ ] **Step 5: Commit**

```bash
git add src/components/FlipClock/FlipClock.tsx src/components/ClawdClockView/ClawdClockView.tsx src/App.tsx
git commit -m "feat(date): wire DateDisplay into FlipClock slot"
```

---

### Task 4: Settings UI + SettingsApp wiring

**Files:**
- Modify: `src/SettingsApp.tsx`

**Interfaces:**
- Consumes: `dateFormat`, `dateEra`, `setDateFormat`, `setDateEra` from `useSettingsStore` (Task 1); `DateFormat`, `DateEra` types (Task 1); `ClawdClockView` now props (Task 3)

- [ ] **Step 1: Update `SettingsApp.tsx` — destructure new settings**

In the `useSettingsStore()` destructure block, add:
```typescript
    dateFormat, dateEra,
    setDateFormat, setDateEra,
```

Also add `DateFormat` and `DateEra` to the type imports at the top:
```typescript
import type { ThemeId } from './themes';
// add after existing imports:
import type { DateFormat, DateEra } from './types';
```

- [ ] **Step 2: Add Date Format setting row**

After the `Time Format` `<SettingRow>` block and before the `Theme` `<SettingRow>`, add:
```typescript
          <SettingRow
            label="Date Format"
            desc="Show date above the clock."
            control={
              <Dropdown
                value={dateFormat === 'none' ? 'None' : dateFormat === 'short' ? 'Short' : 'Long'}
                options={['None', 'Short', 'Long']}
                onChange={v => setDateFormat((v === 'None' ? 'none' : v === 'Short' ? 'short' : 'long') as DateFormat)}
              />
            }
          />
          {dateFormat !== 'none' && (
            <SettingRow
              label="Date Era"
              desc="CE = English, BE = Thai (+543 years)."
              control={
                <SegControl
                  value={dateEra}
                  options={[{ val: 'CE', label: 'CE' }, { val: 'BE', label: 'BE (พศ)' }]}
                  onChange={v => setDateEra(v as DateEra)}
                />
              }
            />
          )}
```

- [ ] **Step 3: Pass `now`, `dateFormat`, `dateEra` to preview `ClawdClockView`**

In the right-side preview `<ClawdClockView ... />`, add three props:
```typescript
              now={now}
              dateFormat={dateFormat}
              dateEra={dateEra}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -30`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/SettingsApp.tsx
git commit -m "feat(date): add Date Format and Date Era settings rows"
```

---

### Task 5: Manual smoke test

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Open Settings window. Verify:
- "Date Format" dropdown appears between Time Format and Theme rows
- Selecting "Short" or "Long" shows "Date Era" row below it
- Selecting "None" hides the Date Era row

- [ ] **Step 2: Test CE short**

Set Date Format = Short, Date Era = CE.
Preview panel should show e.g. `WED 18 JUN 26` above the clock digits.

- [ ] **Step 3: Test BE short**

Set Date Era = BE.
Preview panel should show e.g. `พ. 18 มิ.ย. 69` above clock digits.

- [ ] **Step 4: Test CE long**

Set Date Format = Long, Date Era = CE.
Preview should show e.g. `WEDNESDAY, JUNE 18, 2026`.

- [ ] **Step 5: Test BE long**

Set Date Era = BE.
Preview should show e.g. `วันพุธ, 18 มิถุนายน 2569`.

- [ ] **Step 6: Test none**

Set Date Format = None.
No date shown above clock. Date Era row hidden in settings.

- [ ] **Step 7: Verify persistence**

Change format/era, close Settings, reopen. Values should be retained.
