# Install vstack

You are an AI coding agent. The user gave you this file so you can install **vstack** for them.

**vstack** is a collection of five agent skills:

- `v-build` — build features end-to-end with parallel subagents
- `v-copy-me` — capture a working session as a reusable skill
- `v-fill-me` — catch up on uncommitted, unpushed, and recently merged work
- `v-humanize` — rewrite technical output in plain language
- `v-skill-creator` — scaffold, publish, and install a new `v-` skill

Repository: <https://github.com/MamounHisham1/vstack>

## Rules

- Do not install anything until the user confirms which agents should receive the skills.
- Do not install into an agent the user did not name.
- Do not guess which agents the user has. Detect them, show what you found, and ask.
- If a command fails, report the exact error and stop. Do not retry with destructive flags.
- Do not modify project files other than what the installers themselves change.

## 1. Detect the agents

Find the AI coding agents installed or configured on this machine. Use the tools that are already present; do not install a new agent just to detect it.

Useful checks:

| Agent | Look for |
| --- | --- |
| Claude Code | `claude --version`, `~/.claude/` |
| OpenCode | `opencode --version`, `~/.config/opencode/` |
| Codex | `codex --version`, `~/.codex/` |
| Cursor | `cursor --version`, `~/.cursor/` |
| Gemini CLI | `gemini --version`, `~/.gemini/` |
| Cline | `~/.cline/` |
| Roo Code | `~/.roo/` or the Roo Code extension |
| Windsurf | `~/.windsurf/` or the Windsurf app |
| Amp | `amp --version`, `~/.config/amp/` |
| Aider | `aider --version` |
| Goose | `goose --version` |
| Crush | `crush --version` |
| Kilo | `~/.kilo/` |
| Qwen | `qwen --version` |

The `skills` CLI can also detect agents. Run this **safe list command** first; it lists the repository's skills and reports the agent it detects, without installing anything:

```bash
npx skills add MamounHisham1/vstack --list
```

If a command is not available, say so. Do not infer an agent from a file name alone.

## 2. Ask before installing

Show the user a short table:

| Agent | Detected? | How you know |
| --- | --- | --- |
| Claude Code | yes/no | command or path |
| OpenCode | yes/no | command or path |
| Codex | yes/no | command or path |
| Cursor | yes/no | command or path |
| ... | ... | ... |

Then ask exactly one question:

> Which agents should get vstack? Reply with the names, or "all detected".

Wait for the answer. Do not run the installer yet.

If no agents are detected, ask which agents they use and where those agents are installed.

## 3. Install for the confirmed agents

### Claude Code

If the user chose Claude Code, install the plugin. This adds all five skills and keeps them namespaced:

```bash
claude plugin marketplace add MamounHisham1/vstack
claude plugin install vstack@vstack
```

In Claude Code the skills are namespaced, for example `/vstack:v-build`.

### Other agents

For every other confirmed agent, install all five skills with the skills CLI. Use the agent IDs the CLI reports. Examples of supported IDs include `opencode`, `codex`, `cursor`, `gemini-cli`, `windsurf`, `cline`, `roo`, `amp`, `aider`, `goose`, `crush`, `kilo`, and `qwen`.

```bash
npx skills add MamounHisham1/vstack --skill '*' --agent <agent-id> [<agent-id>...] --global -y
```

- Use `--global` so the skills are available in every project. If the user explicitly asks for a project-local install, drop `--global`.
- Do not include `claude-code` in this command if you installed the plugin above; that would duplicate the install.
- Do not use `--agent '*'`; install only into the agents the user confirmed.

## 4. Verify

List the global installs:

```bash
npx skills ls -g
```

Filter by an agent if needed:

```bash
npx skills ls -g -a <agent-id>
```

For the Claude Code plugin, confirm the installer reported success, or open `/plugin` in Claude Code and check that `vstack` is installed.

## 5. Report

Tell the user:

- which agents were detected,
- which agents they chose,
- which commands ran,
- what is installed,
- how to use the skills: `/vstack:v-build` in Claude Code, or the skill names in the other agents.

If anything failed, include the exact error and the command that failed.
