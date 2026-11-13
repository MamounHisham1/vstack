---
name: v-skill-creator
description: Create a new v- prefixed skill in the vstack repo. Clarify requirements first, scaffold SKILL.md plus slash command, strip personal data, push to GitHub, and install via skills.sh.
---

# v-skill-creator

Create a new skill in this repo (`MamounHisham1/vstack`). Every skill you create here MUST follow the `v-` convention and the publish flow below.

## Non-negotiable rules

1. ID MUST start with `v-`, lowercase kebab-case, 1-64 chars: `^[a-z0-9]+(-[a-z0-9]+)*$`. Example: `v-skill-creator`.
2. Canonical location MUST be `skills/<id>/SKILL.md`.
3. Slash command MUST be `.opencode/commands/<id>.md` so `/<id>` works in OpenCode.
4. NEVER include personal/sensitive data in any created file: no emails, tokens, API keys, passwords, private URLs, real names, home directory paths, machine-specific paths, or chat excerpts.
5. NEVER guess requirements. You MUST clarify until you understand exactly what the user wants, then get explicit confirmation before writing files.
6. After push, you MUST give the install command AND run it to install to the user's coding agents. The `skills` CLI saves the last selected agents and reuses them.

## Workflow

### Phase 0 — Understand exactly what the user wants

Do not scaffold yet. Ask targeted questions:

- Purpose: what task does the skill automate?
- Trigger: when should an agent use it?
- Inputs/outputs: what does it receive and produce?
- Scope: which agents (opencode, claude-code, cursor, etc.)?
- Steps: any known workflow, references, scripts, or examples?
- Name: propose a `v-` id and confirm it.

If the request is vague, ask follow-ups. Summarize your understanding back and wait for a clear "yes, build it" before continuing.

### Phase 1 — Design

Decide:

- `id`: `v-<topic>`, directory name MUST equal id.
- `description`: one sentence, what it does + when to use it. No personal data.
- Body outline: When to Use, Steps, supporting files if needed.
- Whether supporting files are needed: `references/`, `scripts/`. Prefer a single `SKILL.md` unless scripts or large references are required.

### Phase 2 — Scaffold files

Create in the vstack checkout:

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

This makes `/<id>` load the skill in OpenCode.

### Phase 3 — Sanitization gate (blocking)

Before any git operation, scan every new/edited file for:

- email addresses
- API keys, tokens, passwords, `Bearer`, `ghp_`, `sk-`, secrets
- absolute home paths (`/home/`, `/Users/`), machine hostnames
- personal names, phone numbers, private company URLs
- pasted chat logs or user-specific data

Remove or replace with placeholders (`<owner/repo>`, `~`, `$HOME`). Re-read the files after cleaning. If anything looks personal and the user explicitly wants it included, ask for confirmation first. Default is to strip it.

### Phase 4 — Publish to GitHub (registers on skills.sh)

The repo is public `MamounHisham1/vstack`. skills.sh discovers public repos with standard `skills/<name>/SKILL.md` layout, so a public push is the registration step.

Run from the repo root:

```bash
git status --short
git add skills/<id> .opencode/commands/<id>.md README.md
git commit -m "feat(skills): add <id>"
git push origin main
gh repo view MamounHisham1/vstack --json visibility,url
```

Verify push succeeded and visibility is `PUBLIC`. If push fails, fix and retry, do not continue to install.

Update `README.md` skills list if it exists to include the new skill.

### Phase 5 — Install command + manual download

Give the user the exact command:

```bash
npx skills add MamounHisham1/vstack --skill <id> -y
```

Then run it yourself from any worktree. This downloads the skill to the user's coding agents. The CLI saves the last selected agents and reuses them, so omit `-a` unless the user asks for specific agents.

Verify:

```bash
npx skills list --json 2>&1 | head -n 50
```

Optionally check the OpenCode location (`.agents/skills/<id>/SKILL.md` in project, or `~/.config/opencode/skills/` for global installs depending on scope chosen).

Report to the user:

- what was created (file paths)
- commit + GitHub URL
- skills.sh page: `https://skills.sh/MamounHisham1/vstack`
- install command used
- how to trigger next time: `/<id>` in OpenCode, or skill id `<id>` in any agent

## Failure handling

- Unclear requirements: keep asking, do not scaffold.
- Name does not start with `v-`: rename, do not proceed.
- Sanitization finds sensitive data: strip and re-verify.
- Push fails: stop, report, fix.
- Install fails: show full CLI output, retry with `npx skills add MamounHisham1/vstack --skill <id> -l` to list discoverable skills and diagnose layout.
