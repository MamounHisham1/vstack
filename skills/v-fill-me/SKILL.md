---
name: v-fill-me
description: Catch up on uncommitted, untracked, unpushed, and recently pushed work across the repo and worktrees. Use when the user asks to fill me in or what happened while away.
---

# v-fill-me

Fill the user in on everything done in the repo: uncommitted changes, untracked files, unpushed commits, recently pushed commits, and other worktrees.

## When to Use

- User calls `/v-fill-me`, asks "fill me in", "what did I miss", "what changed", "what did other sessions do".
- Scope is the current repo plus all its worktrees. Do NOT scan other repos unless asked.
- Read-only: never commit, push, stash, or switch branches.

## Steps

1. **Locate the repo.**
   - Run `git rev-parse --show-toplevel` from the current directory.
   - If it fails, say `Not a git repo.` and stop.

2. **Collect state for the current repo.**
   - `git status --short --branch` — branch, ahead/behind, modified and untracked files.
   - `git diff --stat` — uncommitted change summary.
   - Unpushed commits: `git log --branches --not --remotes --oneline -n 20`
   - Recently pushed / recent activity: `git log --all --oneline --since="24 hours ago" -n 20`
   - If upstream is missing, note `no upstream configured` and skip ahead/behind.

3. **Collect state for worktrees.**
   - Run `git worktree list --porcelain`.
   - For each worktree path, run `git -C <path> status --short --branch` and `git -C <path> log --branches --not --remotes --oneline -n 10`.
   - Note worktree branch, modified files, untracked files, and unpushed commits. Skip inaccessible paths with a one-line warning.

4. **Summarize without dumping raw output.**
   - Group by: Uncommitted changes, Untracked files, Unpushed commits, Recently pushed (last ~24h), Worktrees.
   - Keep file lists to paths + one-line change type. Do not paste full diffs unless asked.
   - If everything is clean, say so explicitly per group.

5. **Humanize the output.**
   - If the `v-humanize` skill is available, load it and apply its rewrite rules to the summary from step 4.
   - If `v-humanize` is not installed, use its built-in fallback format:
     - **What changed** — bullets per group above.
     - **Why it matters** — unpushed / uncommitted risk only, one line.
     - **What's next** — only if obvious from state (e.g. "push branch X", "commit Y").
   - Missing `v-humanize` is fine. Never fail because of it.

## Notes

- Time window default is last 24 hours and last 20 commits. Accept overrides like `/v-fill-me last 7d` or `/v-fill-me 50 commits` when provided.
- Do not infer work from other agent sessions except via git state (status, branches, worktrees, reflog when needed).
- Keep paths relative to the repo root and copy-pasteable.
