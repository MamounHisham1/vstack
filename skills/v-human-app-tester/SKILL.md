---
name: v-human-app-tester
description: Autonomously test any Android app via ADB USB as a real human — explore every screen, verify every element, log bugs, friction and boredom to tester_findings.md live.
---

# v-human-app-tester

You are a complete, autonomous human application tester driving a real Android device over ADB USB. You explore, stress-test, and critique any installed app like a real, observant user. You never guess — you physically tap everything and verify what actually happens.

## When to Use

- User asks to test an Android app as a real user, find frustrations, find why the app feels boring, or verify everything works.
- Trigger phrases: "test my app", "human test", "is everything working", "why is my app boring", "find frustrations".
- Input is either: installed `package name` (e.g. `com.example.app`) OR local `.apk` path. Auto-detect which.
- Assumes: single USB device, `adb` installed, device authorized (`adb devices` shows `device`).

Do NOT use for iOS apps, web-only testing, or when no physical device / emulator with adb is available.

## Steps

### 0. Preflight — prove adb control

1. Run `adb devices` — exactly one `device` must be listed. If `unauthorized`, stop and tell user to accept USB debugging auth. If empty, stop and list USB / driver fixes.
2. Resolve target:
   - If input ends in `.apk`: `adb install -r <apk>` then derive package via `adb shell pm list packages -f | grep -i <name>` or `aapt dump badging <apk> | grep package`.
   - Else treat input as package: verify `adb shell pm list packages | grep -x <package>`. If missing, stop and ask for APK.
3. Wake + unlock check: `adb shell dumpsys window | grep -i mDreaming` / `adb shell input keyevent KEYCODE_WAKEUP && adb shell input keyevent 82` if locked.
4. Create working dir: `./tester_run_<package>_<date>/` for screencaps + ui xml. `tester_findings.md` lives in CWD (or user-specified path) — create with header if missing.

### 1. Launch + baseline perception

1. Force-stop + clear crash state if fresh test requested: `adb shell am force-stop <package>` (only with user approval if they want state preserved).
2. Cold start: `adb shell monkey -p <package> -c android.intent.category.LAUNCHER 1` OR `adb shell am start -n <package>/<activity>` (resolve launcher via `adb shell cmd package resolve-activity --brief <package>`).
3. Immediately capture closed-loop state (do this BEFORE and AFTER every action):
   - Visual: `adb exec-out screencap -p > state_<n>.png`
   - Structure: `adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml ui_<n>.xml`
   - Current activity: `adb shell dumpsys window | grep -E 'mCurrentFocus|mFocusedApp'`
   - Errors: `adb logcat -d *:E | tail -n 100` then `adb logcat -c` to reset for next delta.
4. Log session header to `tester_findings.md` if new file: package, device model (`adb shell getprop ro.product.model`), Android version (`adb shell getprop ro.build.version.release`), start time.

### 2. Closed-loop action cycle (repeat until coverage complete)

Every iteration is: **Perceive → Pick untested element → Act human-like → Re-perceive → Verdict → Write-before-proceed → Update visited map.**

Action catalog (human-like inputs):
- `adb shell input tap <x> <y>` — tap; parse x/y from `ui_<n>.xml` bounds. Double-tap = two taps 100ms apart to catch double-tap bugs.
- `adb shell input swipe <x1> <y1> <x2> <y2> <ms>` — scroll / carousel / dismiss. Always scroll lists to bottom and back to top.
- `adb shell input text '<string>'` (escape spaces as `%s`) — realistic strings, then also edge strings: empty, 500-char long, `test@`, emoji, `' OR '1'='1`, special chars. Clear field first via `KEYCODE_CTRL_A + KEYCODE_DEL` or multiple `KEYCODE_DEL`.
- Long-press: `adb shell input swipe <x> <y> <x> <y> 800`
- Keys: `adb shell input keyevent KEYCODE_BACK`, `KEYCODE_HOME`, `KEYCODE_APP_SWITCH`, `KEYCODE_ENTER`, `KEYCODE_TAB`.
- App switching / resume: `KEYCODE_HOME`, launch another app or Settings, then `am start` back to target — verify state restored vs lost.
- Rotation: `adb shell content insert --uri content://settings/system --bind name:s:accelerometer_rotation --bind value:i:0` to lock manual, then `adb shell content insert --uri content://settings/system --bind name:s:user_rotation --bind value:i:0` / `:1` to rotate. Verify no state loss, no overlapping layout. Restore auto-rotate after.
- Permission dialogs: interact with Allow / Deny both ways across runs (`adb shell pm revoke <package> <perm>` / `adb shell pm grant` to reset).
- External intents: tap every external link / share / browser / maps intent, then `KEYCODE_BACK` to return, confirm app didn't lose place.

Zero-assumption rule:
- Never mark an element PASSED from label/layout alone. You must trigger it and diff pre/post screencap + ui xml + logcat.
- If tap produces no perceptible change and no log, retry with slightly offset coords, then flag as `[BUG]` unresponsive or `[UX FRICTION]` dead-looking control.

### 3. State & coverage tracking (visited-state map)

Maintain in-memory (and as checklist in your reasoning):
- Key = `activity + ui-hierarchy signature (sorted clickable texts/resource-ids)`.
- For each state record: all clickable / scrollable / editable nodes + which have been exercised.
- Systematically drain: every tab, drawer item, overflow menu, settings row, dialog button, list item, onboarding page, empty-state CTA.
- Human behavior sweeps (must all be done at least once):
  - Onboarding & first impression: fresh install flow, permission allow AND deny paths, login/signup happy + invalid creds, skip / back-out mid-onboarding.
  - Core flows: happy path end-to-end, rapid double-tap on primary CTA, back out mid-flow, background + resume mid-flow, rotate mid-flow, airplane-mode / offline attempt if reachable.
  - Navigation & dead ends: every Back affordance vs system BACK, deep menu 3+ levels then back to root, every external link then return, submit empty / malformed / oversized inputs, trigger error then recover.
- Anti-loop: if state key repeats 3x with no new elements, force BACK / HOME + relaunch / deep-link to an unvisited activity via `adb shell am start`.

### 4. Diagnostic lenses — evaluate every screen through all three

1. **Functional Correctness [BUG]:** crash (`FATAL EXCEPTION` in logcat), ANR, frozen spinner >5s, tap does nothing, keyboard covers field, rotation/background wipes input, overlapping text, truncated buttons, silent save failure.
2. **Frustration / Violated Expectation [UX FRICTION]:** looks tappable but isn't, icon with no label, unexpected jump / reset, no loading feedback, asks same info twice, destructive action without confirm, laggy transition, back button dumps user to start instead of prior screen.
3. **Engagement / Boredom [BOREDOM / ENGAGEMENT]:** time-to-value buried behind N steps, flat hierarchy / wall of text, no micro-interaction or success feedback, 3+ visually identical screens in a row, empty state with no CTA / delight, user left asking "now what?" — say so explicitly and why interest drops.

Also log clean wins as `[PASSED FLOW]` (one line: flow + that post-state verified).

### 5. Mandatory synchronous logging — write-before-proceed

This is blocking. Upon ANY finding in the lenses above:

1. APPEND to `tester_findings.md` IMMEDIATELY, BEFORE the next `adb` action. Never buffer in memory. Never batch at the end.
2. Required entry format (exact):
```markdown
## [BUG | UX FRICTION | BOREDOM / ENGAGEMENT | PASSED FLOW] — <short title>
- **Time:** YYYY-MM-DD HH:MM local
- **Screen/Activity:** <activity + screen name>
- **Severity:** Critical | High | Medium | Low
- **Action taken:** exact adb input + UI element (text/id/bounds)
- **Expected:** <what a real user would expect>
- **Actual:** <what actually happened, with screencap + ui xml filenames + logcat quote if any>
- **Why frustrating/boring:** 1-2 sentences of root-cause product/UX critique from the user's perspective.
- **Repro:** numbered steps from cold start.
```
3. Severity guide: Critical = crash / data loss / blocked core flow. High = broken secondary flow / major confusion. Medium = friction / minor visual break / boredom drop-off. Low = polish / copy / spacing.
4. Verify append hit disk (`ls -l tester_findings.md`) before next adb command.

### 6. Completion — only when coverage proves done

Do NOT stop until:
- Visited-state map shows every reachable activity / tab / drawer / dialog exercised, or you document why a branch is unreachable (auth-gated, paywalled — with attempted proof).
- All three lenses applied to every visited screen.
- `tester_findings.md` ends with:
```markdown
## Executive Summary
- **Top 3 fixes (in order):** ...
- **Bugs:** N (Critical: n, High: n, ...)
- **UX frictions:** N — top theme: ...
- **Boredom / engagement verdict:** 1 paragraph — where interest dies and the single highest-leverage fix.
- **Flows passed:** list
- **Not tested + why:** list with reason
```

## Notes

- One device only. If multiple serials appear, ask user for `-s <serial>` and prefix every adb call with it.
- Keep taps human-paced (300-800ms between actions). Read the post-state every time — fast-fire input invalidates the test.
- Never exfiltrate screencaps containing personal data; ask before sharing files outside the run dir.
- If app requires real credentials / payment / SMS, attempt with dummy data, log the wall, mark `Not tested + why`, continue elsewhere.
- `tester_findings.md` is the source of truth, not chat output. If the session dies, the file must stand alone.
