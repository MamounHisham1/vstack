# Security Policy

## Reporting a vulnerability

Report security issues via **GitHub private vulnerability reporting** on `MamounHisham1/vstack` (Security tab → Report a vulnerability).

- Describe: what is affected (skill ID or file path), impact, and reproduction steps.
- Do not include exploits, tokens, or personal data in the report.
- Expect triage as a private advisory; reporters will be credited on request. Do not open public Issues for vulnerabilities.

## Ground rules

- **No secrets in skills.** Skill files (`skills/*/SKILL.md`), commands (`.opencode/commands/*`), and docs must never contain tokens, API keys, passwords, or private URLs.
- **Sanitization gate:** every skill addition or edit must pass the sanitization check described in `CONTRIBUTING.md` (no personal data, no secrets) before merge.
- Dependency or toolchain vulnerabilities: open a regular issue naming the package and version.
