# vstack

Personal skill collection. Every skill ID starts with `v-` and ships with a matching slash command.

[![skills.sh](https://skills.sh/b/MamounHisham1/vstack)](https://skills.sh/MamounHisham1/vstack)

## Install as plugin (one install, all skills)

In a Claude Code session (v2.1.275+):

```text
/plugin install vstack --marketplace MamounHisham1/vstack
```

Or from the shell:

```bash
claude plugin marketplace add MamounHisham1/vstack
claude plugin install vstack@vstack
```

This installs the `vstack` plugin with every `v-` skill. Skills run namespaced, e.g. `/vstack:v-build`.

## Install via skills CLI (per-agent)

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
.claude-plugin/plugin.json          # Claude Code plugin manifest (one plugin, all skills)
.claude-plugin/marketplace.json     # marketplace catalog for `claude plugin marketplace add`
```

## Skills

- `v-skill-creator` — create a new `v-` skill in this repo, publish it, and install it. Run `/v-skill-creator`.
- `v-copy-me` — extract how you work from the session and create or update `v-` skills. Run `/v-copy-me`.
- `v-build` — build features with parallel subagents: decomposes big features into slices, fans out batches, ships as reviewed PRs, merges + syncs. Run `/v-build`.
- `v-fill-me` — catch up on uncommitted, untracked, unpushed, and recently pushed work across repo and worktrees. Run `/v-fill-me`.
- `v-humanize` — rewrite long or technical AI output into plain human-readable language. Run `/v-humanize`.
