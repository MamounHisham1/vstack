---
name: v-copy-me
description: Extract workflow patterns from the current session and create or update v- skills in the vstack repo. Use when asked to copy, learn, or save how work gets done into skills.
---

# v-copy-me

Fork of `v-skill-creator` for learning. When called in a session, it mines how the user works, diffs against existing skills, and creates or updates skills with only what is new. If nothing is new, it reports nothing to add and writes nothing.

## Non-negotiable rules

1. ID MUST start with `v-`, lowercase kebab-case, 1-64 chars: `^[a-z0-9]+(-[a-z0-9]+)*$`.
2. Canonical location MUST be `skills/<id>/SKILL.md`.
3. Slash command MUST be `.opencode/commands/<id>.md` so `/<id>` works in OpenCode.
4. NEVER include personal/sensitive data in any created file: no emails, tokens, API keys, passwords, private URLs, real names, home directory paths, machine-specific paths, or chat excerpts.
5. NEVER guess workflow. Only codify patterns actually observed in the analyzed session input. If input is too thin, say so and stop.
6. After push, you MUST give the install command AND run it to install to the user's coding agents. The `skills` CLI saves the last selected agents and reuses them.

## When to Use

- User calls `/v-copy-me` or asks to copy, learn, save, or distill how they work into skills.
- User is discussing a topic (example: data structures) and wants the reusable workflow saved.
- Session contains repeated tool choices, commands, steps, preferences, or corrections worth reusing.

Do NOT use for one-off answers with no reusable pattern. Do NOT use to memorize domain facts, definitions, or explanations. Focus is how work gets done, not what the topic is.

## Steps

### 0. Collect input

- Default source: the current conversation up to this call.
- Also accept pasted transcript, session export, or a file path the user provides as extra input.
- If input is empty or too short to infer a pattern, stop and say so. Do not invent workflow.

Extract only reusable workflow signals:

- repeated tool choices and commands
- step order, checks, verification habits
- stated preferences and corrections ("always / never", "prefer X over Y")
- templates, file layouts, naming conventions the user enforced

Ignore one-off chatter and domain trivia unless it changes the workflow.

### 1. Find matching skills

Lookup scope is the vstack repo only:

```text
skills/v-*/SKILL.md
```

- List existing skill IDs and read the closest matches (name + description + Steps).
- Decide: update existing skill, create new `v-<topic>` skill, or nothing to add.
- A new skill is warranted only if no existing skill covers the workflow. Prefer updating over duplicating.

### 2. Diff what is new

- Compare extracted patterns against the matched SKILL.md content.
- Keep only additive, non-duplicate behaviors.
- If everything observed is already covered: output `Nothing to add.` with 1-2 lines explaining what was checked, then stop. Write no files.

### 3. Create or update files

Single-file skills preferred. Create in the vstack checkout:

```text
skills/<id>/SKILL.md
.opencode/commands/<id>.md
```

`skills/<id>/SKILL.md` template:

```markdown
---
name: <id>
description: <one-line purpose + when to use>
---

# <Title>

## When to Use

...

## Steps

1. ...
2. ...

## Notes

...
```

Paths written inside the skill are relative to the directory containing `SKILL.md`.

`.opencode/commands/<id>.md` template:

```markdown
---
description: <same purpose, short>
---

Use the <id> skill to handle this request. Load skill <id> first, then follow its SKILL.md exactly. Request: $ARGUMENTS.
```

For updates: edit the existing `SKILL.md` in place, appending only the new patterns under Steps/Notes. Do not rewrite unrelated sections. Do not rename the skill.

### 4. Sanitization gate (blocking)

Before any git operation, scan every new/edited file for:

- email addresses
- API keys, tokens, passwords, `Bearer`, `ghp_`, `sk-`, secrets
- absolute home paths (`/home/`, `/Users/`), machine hostnames
- personal names, phone numbers, private company URLs
- pasted chat logs or user-specific data

Remove or replace with placeholders (`<owner/repo>`, `~`, `$HOME`). Re-read the files after cleaning. If anything looks personal and the user explicitly wants it included, ask for confirmation first. Default is to strip it.

### 5. Publish to GitHub (registers on skills.sh)

The repo is public `MamounHisham1/vstack`. skills.sh discovers public repos with standard `skills/<name>/SKILL.md` layout, so a public push is the registration step.

Run from the repo root:

```bash
git status --short
git add skills/<id> .opencode/commands/<id>.md README.md
git commit -m "feat(skills): add <id>"
git push origin main
gh repo view MamounHisham1/vstack --json visibility,url
```

For updates use `git commit -m "feat(skills): update <id>"`.

Verify push succeeded and visibility is `PUBLIC`. If push fails, fix and retry, do not continue to install.

Update `README.md` skills list if it exists to include the new skill.

### 6. Install command + manual download

Give the user the exact command:

```bash
npx skills add MamounHisham1/vstack --skill <id> -y
```

Then run it yourself from any worktree. This downloads the skill to the user's coding agents. The CLI saves the last selected agents and reuses them, so omit `-a` unless the user asks for specific agents.

Verify:

```bash
npx skills list --json 2>&1 | head -n 50
```

Report to the user:

- what was created or updated (file paths + 3-5 bullet summary of new patterns)
- or `Nothing to add` with what was checked
- commit + GitHub URL
- skills.sh page: `https://skills.sh/MamounHisham1/vstack`
- install command used
- how to trigger next time: `/v-copy-me` in OpenCode to learn again, or `/<id>` / skill id `<id>` to use the saved skill

## Failure handling

- Thin input: say input is too thin, do not invent patterns.
- Nothing new: output `Nothing to add`, write no files, commit nothing.
- Name does not start with `v-`: rename, do not proceed.
- Sanitization finds sensitive data: strip and re-verify.
- Push fails: stop, report, fix.
- Install fails: show full CLI output, retry with `npx skills add MamounHisham1/vstack --skill <id> -l` to list discoverable skills and diagnose layout.
