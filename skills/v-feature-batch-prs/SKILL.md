---
name: v-feature-batch-prs
description: Ship a batch of small features from one working tree as separate reviewed PRs — recon-scope parallel subagents, split the dirty tree into branches (incl. shared-file hunk splitting), severity-gated review, sequential merge + local sync.
---

# v-feature-batch-prs

Turn "here are N small features, go" into N clean, reviewed, merged PRs in one pass.

## When to Use

- Several small features or fixes were requested at once and built (or buildable) in a single working tree, uncommitted.
- The repo ships via PRs and the user wants parallel agents plus a review before merge.
- Features mostly touch different files, with at most small shared files (string tables, index barrels).

Do NOT hunk-split files with substantial overlapping edits — combine those features into one PR instead.

## Steps

1. **Recon before dispatch.** Locate each target file and the pattern to reuse (existing dialogs, scroll-chrome components, share helpers). Use the recon to assign each subagent NON-OVERLAPPING file ownership — this is what makes parallel work merge-safe.

2. **Dispatch parallel subagents with complete briefs.** Every brief needs:
   - exact file scope + an explicit "do NOT touch these files (another agent owns them)" list
   - the repo's own rules the work must honor (style, i18n/RTL parity, press-feedback conventions, never-native-dialog rules — whatever the project enforces)
   - verification commands to run (typecheck, lint) and "leave changes uncommitted"
   - a report format: decision + why, files changed, verification results

3. **Verify the union.** One typecheck/lint over the combined tree before branching.

4. **Split the tree into branches.**
   - `git diff -- <owned files>` per feature → patch files (untracked new files: just `git add` them on their branch).
   - Shared files (string tables, barrels): split the diff by hunk, keeping a hunk only if its body matches a feature-unique key (small awk filter over the diff; keep the file header + selected hunks — line numbers are absolute so single hunks apply cleanly).
   - Per branch: `git checkout -b <id> origin/main` — ALWAYS base on origin/main. Never `checkout -b` while standing on the previous feature branch: that stacks PRs, and after the first merge GitHub reports phantom conflicts between amended and original commits.
   - Stage owned files + `git apply --cached` the shared hunks; commit per feature.
   - **Typecheck each branch independently** — they merge separately, so each must stand alone.

5. **Open PRs.** Push all branches in one command. Body per PR: What / Why (decision + rejected alternatives) / Test checklist.

6. **Review gate.** One read-only review subagent for the batch. Require:
   - severity-tagged findings (P0 blocker / P1 should-fix / P2 / P3 nit), each with file:line, one-paragraph cause, concrete fix
   - claims verified against the actual diff and surrounding code — no speculation
   - pre-existing issues proven by linting/diffing the HEAD baseline
   - a final verdict per PR: MERGE or FIX-FIRST

7. **Fix pre-merge, cheaply.** Apply only small, in-scope findings — real UX gaps and rule violations. Per branch: checkout → edit → typecheck → `git commit --amend` → `git push --force-with-lease`. Skip speculative refactors and pre-existing debt; record those as follow-ups.

8. **Merge sequentially.** Merge PRs one at a time (merge commits, matching repo history). If a later PR reports conflicts, that is almost always branch-base drift, not a real conflict: `git merge --abort`, rebuild the branch on fresh origin/main with `git cherry-pick <feature-commit>`, typecheck, force-push, retry. GitHub needs a few seconds to recompute mergeability after a force-push — don't hammer the merge call.

9. **Sync locally.** Fetch, fast-forward main in the worktree that owns it, move analysis worktrees onto the new main (detached is fine), delete merged local branches. For remote branches, check the repo's convention first (were past merged branches kept or deleted?) and follow it.

## Notes

- One review agent for a batch of related PRs is fine; split reviewers only when the domains differ wildly.
- Review findings carry no authority — re-verify each against the diff before fixing anything.
- Cap fix rounds: apply the cheap high-value findings once, then merge. A review loop that re-litigates P3s never ships.
- Record project-specific lessons in the project's own memory/notes, not in this skill.
