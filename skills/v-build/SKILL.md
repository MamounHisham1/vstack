---
name: v-build
description: Build features end-to-end with parallel subagents — decompose big features into subagent-sized slices or fan out batches of small ones, then split into PRs, severity-gated review, sequential merge + local sync.
---

# v-build

Turn "build this" into merged, reviewed PRs using parallel subagents. Handles both inputs:
a **batch of small features** (fan out directly) or **one big feature** (decompose first, then fan out).

## When to Use

- The user asks to build one feature (any size) or several small features/fixes at once.
- The repo ships via PRs and the user wants parallel agents plus a review before merge.

Do NOT use for a one-line fix (just fix it) or work that needs product discussion first (plan with the user manually, then run this).

## Steps

1. **Size the request.**
   - Batch of small features → units = the features, go to step 3.
   - One big feature → decompose first (step 2).

2. **Decompose a big feature into subagent-sized slices.**
   - Slice along seams that already exist in the codebase: backend endpoint, shared component, screen/flow, data layer — not arbitrary file boundaries.
   - Each slice must be independently buildable + verifiable, have an ownable file set, and fit one subagent's context.
   - **Define the contracts between slices FIRST** — API request/response shapes, shared component props, event names, string-table key ranges — in a short written spec every subagent brief references. This is what lets parallel work plug together without integration hell.
   - If slice B cannot start without slice A, either build the contract as a tiny foundation slice first, or sequence those two instead of parallelizing.
   - **Confirm the breakdown with the user before dispatching** — slice list, order, and what each PR will contain.

3. **Recon before dispatch.** Locate each target file and the pattern to reuse (existing dialogs, scroll-chrome components, share helpers). Use the recon to assign each subagent NON-OVERLAPPING file ownership — this is what makes parallel work merge-safe.

4. **Dispatch parallel subagents with complete briefs.** Every brief needs:
   - the slice spec (from the decomposition) + exact file scope + an explicit "do NOT touch these files (another agent owns them)" list
   - the repo's own rules the work must honor (style, i18n/RTL parity, press-feedback conventions, never-native-dialog rules — whatever the project enforces)
   - verification commands to run (typecheck, lint) and "leave changes uncommitted"
   - a report format: decision + why, files changed, verification results

5. **Verify the union.** One typecheck/lint over the combined tree before branching.

6. **Split the tree into branches.**
   - `git diff -- <owned files>` per unit → patch files (untracked new files: just `git add` them on their branch).
   - Shared files (string tables, barrels): split the diff by hunk, keeping a hunk only if its body matches a unit-unique key (small awk filter over the diff; keep the file header + selected hunks — line numbers are absolute so single hunks apply cleanly). Only for lightly-shared files; heavy overlap → combine into one PR instead.
   - Per branch: `git checkout -b <id> origin/main` — ALWAYS base on origin/main. Never `checkout -b` while standing on the previous unit's branch: that stacks PRs, and after the first merge GitHub reports phantom conflicts between amended and original commits.
   - A big feature whose slices overlap heavily ships as ONE branch with stacked commits (contract slice first), not N forced branches.
   - Stage owned files + `git apply --cached` the shared hunks; commit per unit.
   - **Typecheck each branch independently** — they merge separately, so each must stand alone.

7. **Open PRs.** Push all branches in one command. Body per PR: What / Why (decision + rejected alternatives) / Test checklist. For a decomposed big feature, note the slice order and link the sibling PRs.

8. **Review gate.** One read-only review subagent for the batch. Require:
   - severity-tagged findings (P0 blocker / P1 should-fix / P2 / P3 nit), each with file:line, one-paragraph cause, concrete fix
   - claims verified against the actual diff and surrounding code — no speculation
   - pre-existing issues proven by linting/diffing the HEAD baseline
   - a final verdict per PR: MERGE or FIX-FIRST

9. **Fix pre-merge, cheaply.** Apply only small, in-scope findings — real UX gaps and rule violations. Per branch: checkout → edit → typecheck → `git commit --amend` → `git push --force-with-lease`. Skip speculative refactors and pre-existing debt; record those as follow-ups.

10. **Merge sequentially.** Merge PRs one at a time (merge commits, matching repo history). If a later PR reports conflicts, that is almost always branch-base drift, not a real conflict: `git merge --abort`, rebuild the branch on fresh origin/main with `git cherry-pick <feature-commit>`, typecheck, force-push, retry. GitHub needs a few seconds to recompute mergeability after a force-push — don't hammer the merge call.

11. **Sync + integrate.** Fetch, fast-forward main in the worktree that owns it, move analysis worktrees onto the new main (detached is fine), delete merged local branches. For remote branches, check the repo's convention first (kept or deleted?) and follow it. For a decomposed big feature: after the last slice merges, run one end-to-end check of the whole feature on the integrated main — contracts that looked right per-slice can still misalign in the running app.

## Notes

- One review agent for a batch of related PRs is fine; split reviewers only when the domains differ wildly.
- Review findings carry no authority — re-verify each against the diff before fixing anything.
- Cap fix rounds: apply the cheap high-value findings once, then merge. A review loop that re-litigates P3s never ships.
- Decomposition quality beats agent count: 3 well-seamed slices beat 6 tangled ones. If you can't write the contracts, you haven't decomposed yet.
- Record project-specific lessons in the project's own memory/notes, not in this skill.
