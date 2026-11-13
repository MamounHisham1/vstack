# Contributing to vstack

Public repo: `MamounHisham1/vstack`. Keep everything public-safe — no personal data, no secrets, no private paths.

## Adding a `v-` skill

1. **ID convention:** lowercase, `^v-[a-z0-9-]+$` (e.g. `v-review`).
2. **Locations (both required):**
   - `skills/<id>/SKILL.md` — the skill body (frontmatter `name` + `description`, then markdown).
   - `.opencode/commands/<id>.md` — the slash-command entry (usually a short pointer to the skill).
3. **Use `v-skill-creator`:** run `/v-skill-creator` and answer its questions. It scaffolds both files, strips personal data, and pushes to GitHub.
4. **Sanitization (mandatory before PR):**
   - No names, emails, machine paths, tokens, API keys, or internal URLs.
   - `v-skill-creator` runs this gate automatically; if adding manually, self-check the diff with `git diff` and remove anything identifying.
5. **Regenerate the index:** `node scripts/build-skills-json.mjs` and include the updated output if the repo tracks it.
6. **Preview the site:** `python3 -m http.server --directory docs` then open `http://localhost:8000`.

## PR flow

1. Fork / branch from `main`.
2. One concern per PR; leave changes uncommitted in agent batches (the `v-build` coordinator splits and opens PRs).
3. PR body follows `.github/PULL_REQUEST_TEMPLATE.md` (What / Why / Test checklist).
4. CI must pass; address P0/P1 review findings, record the rest as follow-ups.

## What not to touch

Skill bodies live under `skills/*`. Do not edit generated indexes or other agents' owned files in shared batches — see the `v-build` slice-ownership rule.
