# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS, and vanilla JavaScript deployed to GitHub Pages. No frontend build step; `scripts/build-skills-json.mjs` regenerates the skill data and the static skill rows.

## Users

Developers who work with coding agents, primarily Claude Code and OpenCode users arriving from GitHub, skills.sh, or shared links. Secondary audiences: the author, using the site as a living reference, and people evaluating the author's craft. Visitors are usually in a terminal-adjacent context, deciding whether a skill is worth installing. Many now prefer to hand an install link to their agent rather than run commands themselves.

## Product Purpose

vstack is a personal collection of agent skills distributed as one Claude Code plugin or installed individually through the `skills` CLI. The site exists to make the collection legible and to get a visitor to install the set. The primary path is one `install.md` link given to an AI agent; the manual plugin and per-skill commands remain for people who prefer the terminal. Success is a completed install, not time on page.

## Positioning

Every skill starts with `v-`, ships as one readable `SKILL.md`, and has a matching slash command. They are built for shipping real work: `v-build` decomposes features across parallel subagents and lands reviewed PRs; `v-fill-me` reconstructs what happened across branches and worktrees; `v-humanize`, `v-copy-me`, and `v-skill-creator` close the loop from output to workflow to new skill. No hidden runtime, no proprietary service, MIT licensed.

## Operating Context

Visitors read the site beside a terminal, often after seeing a repo or a skills.sh listing. The fastest path is to copy the install link and paste it into Claude Code, OpenCode, Codex, Cursor, or another coding agent. The agent reads the prompt, detects installed agents, asks which should receive the skills, then installs. Manual commands must stay exact, copyable, and visible for visitors who want to run them by hand.

## Capabilities and Constraints

- Five skills: `v-build`, `v-copy-me`, `v-fill-me`, `v-humanize`, `v-skill-creator`.
- One Claude Code plugin (`vstack`) installs all five; per-skill installs go through `npx skills add MamounHisham1/vstack --skill <id> -y`.
- OpenCode slash commands ship in `.opencode/commands/` as `/<skill-id>`.
- `docs/install.md` is a self-contained agent prompt: detect installed agents, ask which should receive the skills, install all five, verify. The copied link is `https://mamounhisham1.github.io/vstack/install.md`.
- Static site only. Must work on GitHub Pages, without a server, and keep the five skills and commands readable without JavaScript.
- `scripts/build-skills-json.mjs` regenerates `docs/data/skills.json` and injects the static skill rows, install rows, and pickers.
- MIT licensed.

## Brand Commitments

The name is `vstack`. The existing tagline "skills that ship" is a confirmed voice anchor. Tone is direct, technical, and understated; no hype, no invented proof. The `v-` prefix is part of the identity.

## Evidence on Hand

Real skill descriptions in `docs/data/skills.json` and `skills/*/SKILL.md`; real install commands in `README.md`, `.claude-plugin/`, and the skills CLI help; real repository at github.com/MamounHisham1/vstack. There are no testimonials, customer logos, usage metrics, or benchmarks. Do not fabricate any.

## Product Principles

1. Show the command, not a claim about the command.
2. The smallest useful surface: five skills, one plugin, no filler.
3. Every skill is readable source; trust comes from inspection.
4. Ship through real workflow: parallel slices, reviewed PRs, merged results.
5. The agent asks before it installs. Never install into an unconfirmed agent.
6. Understate. Let the work carry the pitch.

## Accessibility & Inclusion

Core content must remain readable without JavaScript. Keyboard access, visible focus, reduced-motion support, 44px primary controls, and WCAG AA contrast are required.
