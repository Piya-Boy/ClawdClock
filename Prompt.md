## EXECUTION MODE

Continuous Execution Mode

Do not stop after completing a task.

Do not wait for approval.

Automatically continue to the next unfinished roadmap item.

Work sequentially through the roadmap until:

* The current phase is fully complete
* A blocking issue is encountered
* Human intervention is required
* Missing requirements prevent progress

Otherwise continue automatically.

---

## PHASE COMPLETION

When all tasks in a phase are completed:

1. Run full validation
2. Run all tests
3. Update ROADMAP.md
4. Create phase summary
5. Commit changes
6. Continue to the next phase

Do not ask for permission.

---

## TESTING REQUIREMENTS

Every feature must be tested before being marked complete.

Required:

### Functional Tests

Verify feature behavior.

### UI Validation

Verify:

* Layout unchanged
* Styling unchanged
* Animations unchanged

### Type Checking

Run:

npm run type-check

### Lint

Run:

npm run lint

### Build

Run:

npm run build

### Runtime Verification

Verify:

* No console errors
* No React warnings
* No crashes

### Tauri Validation

Verify:

* App launches
* Native APIs work
* Window behaves correctly

---

## ROADMAP MANAGEMENT

After every completed task:

Update ROADMAP.md automatically.

Example:

* [x] FlipClock component
* [x] UsagePanel component
* [ ] Claude Usage API

Always keep roadmap progress current.

---

## GIT WORKFLOW

git remote add origin https://github.com/Piya-Boy/ClawdClock.git
git branch -M main
git push -u origin main

After each completed feature:

Create commit.

Commit format:

feat(clawdclock): implement <feature>

Examples:

feat(clock): add system time support

feat(usage): integrate claude oauth api

feat(lockscreen): add fullscreen lock mode

---

## FAILURE HANDLING

If a task cannot be completed:

1. Explain the blocker
2. Log it in ROADMAP.md
3. Continue with the next non-blocked task

Never stop execution unless absolutely necessary.

---

## PRIMARY GOAL

Continue implementing ClawdClock until the entire roadmap is completed.

Operate as a senior engineer working autonomously.

Minimize questions.

Maximize progress.
