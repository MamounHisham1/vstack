---
name: v-device-debug
description: Debug an app running on a physical device you cannot touch — user sends screenshots, you root-cause, rebuild remotely, deliver over a tunnel, repeat until green.
---

# v-device-debug

You cannot adb into the device. The user is your hands and eyes: they install builds, screenshot failures, and report what they see. Your job is to make every round-trip converge — each build must either fix the bug or reveal the next fact.

## When to Use

- The app runs on a phone/device only the user holds; you have no adb/logcat access.
- The loop is: user screenshot → you diagnose → remote build → tunnel delivery → user installs → next screenshot.
- Works alongside any build host (cloud VM, CI, local machine) and any tunnel.

Do NOT use when you have direct device access (just use adb), or for emulator-only work (no user loop needed).

## Steps

1. **Read the screenshot literally.**
   - Transcribe the exact error text (exception class, message, exit codes, percentages, step names). Quote it back — never paraphrase an error from memory.
   - Note what PASSED around the failure (green checks, completed steps). Passed steps bound the fault: the bug is downstream of everything green.
   - One screenshot = one failure class. Fix that class before theorizing about the next.

2. **Root-cause against sources, not comments.**
   - Trace the quoted error to the exact code path that emits it.
   - Verify third-party behavior against the pinned source (docs, upstream repo at the pinned version), not against code comments or your memory of the API. If the source says the flag doesn't exist, the flag doesn't exist.
   - Name the mechanism in one sentence before writing any fix (e.g. "the wrapper's `--` becomes the command because the tool parses positionally").

3. **Make the fix minimal and the error self-diagnosing.**
   - Smallest diff that fixes the proven cause. No refactors, no drive-by cleanups. Contract/spec files are law — record any deviation for ratification.
   - If the failure discarded the diagnosis (generic message, swallowed stdout/stderr), fix the reporting FIRST: carry the tail of the real output into the user-visible message (bounded, secrets-free). The next screenshot must name its cause even if your fix is wrong.
   - Add a cheap discriminator when two causes look identical (e.g. a smoke test that separates "launcher broken" from "command failed"). A failing discriminator is worth more than a speculative fix.
   - Add a regression test for anything reproducible off-device (parsers, recipes, string handling). If the test passes and the device still fails, you have eliminated a class — say so explicitly.

4. **Bump the delivery version every build.**
   - Increment the build number / version code with each fix so the new artifact installs over the old one. Never ask the user to uninstall first unless data must be wiped.

5. **Gate the build before shipping.**
   - Run the full test suite and the artifact checks (hashes of vendored binaries, ABI list, package name). A build that isn't green never reaches the user.
   - Record per-fix commits with the root cause in the message, not just the symptom.

6. **Deliver over a tunnel and verify through it.**
   - Serve the artifact + a small status page (version, hash, install steps, what changed in this build) over a local server exposed through a tunnel.
   - Verify by downloading the artifact back through the PUBLIC URL and comparing hashes byte-for-byte. The page should self-check reachability so the user can tell at a glance whether the tunnel is up.
   - Confirm the served bytes, content type, and version string before telling the user to install.

7. **Ask for exactly one round-trip of evidence.**
   - Tell the user what to do (install over, hit Retry, wait N seconds) and what to send back: the new error text as a screenshot, plus 1–2 specific observations (e.g. "does the keyboard open?", "does + add a tab?").
   - State what each possible answer would mean. The user should never wonder why you're asking.

8. **Log the session honestly.**
   - Keep a running log in the repo docs: what was proven, what was fixed (with commit), what is still unproven. Mark emulator/proxy results as explicitly NOT device proof.
   - Keep test-only scaffolding (ABI shims, bypasses, debug overlays) on a throwaway branch or behind a flag. The shipping branch stays shippable.

## Notes

- Speed of convergence beats breadth of investigation: a build that reveals the next fact is progress, even if it doesn't fix anything.
- When a fix works, say what the screenshot proved and why the fix was correct — the user is learning to read these traces too.
- Never claim a feature works until it passes on the real device. Proxy passes are progress reports, not verdicts.
