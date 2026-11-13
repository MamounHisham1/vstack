# vstack

Personal skill collection. Every skill ID starts with `v-` and ships with a matching slash command.

[![skills.sh](https://skills.sh/b/MamounHisham1/vstack)](https://skills.sh/MamounHisham1/vstack)

## Install

```bash
npx skills add MamounHisham1/vstack --skill v-skill-creator -y
```

Install a specific skill:

```bash
npx skills add MamounHisham1/vstack --skill <skill-id> -y
```

Install everything:

```bash
npx skills add MamounHisham1/vstack --skill '*' -y
```

The `skills` CLI remembers your last selected agents and reuses them on the next install.

## Layout

```text
skills/<skill-id>/SKILL.md          # canonical skill (skills.sh + agents)
.opencode/commands/<skill-id>.md    # OpenCode slash command /<skill-id>
```

## Skills

- `v-skill-creator` — create a new `v-` skill in this repo, publish it, and install it. Run `/v-skill-creator`.
- `v-copy-me` — extract how you work from the session and create or update `v-` skills. Run `/v-copy-me`.
- `v-feature-batch-prs` — turn a batch of features built in one working tree into separate reviewed PRs and merge them. Run `/v-feature-batch-prs`.
