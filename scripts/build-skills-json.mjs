#!/usr/bin/env node
// Build docs/data/skills.json from skills/*/SKILL.md frontmatter.
// Uses only node stdlib (fs/path). Runnable via: node scripts/build-skills-json.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT_FILE = path.join(ROOT, "docs", "data", "skills.json");

function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // strip surrounding quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function prettyTitle(id) {
  return id
    .split("-")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const entries = [];
const dirs = fs
  .readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const id of dirs) {
  const skillFile = path.join(SKILLS_DIR, id, "SKILL.md");
  if (!fs.existsSync(skillFile)) continue;
  const text = fs.readFileSync(skillFile, "utf8");
  const fm = parseFrontmatter(text);
  const name = fm.name || id;
  const description = fm.description || "";
  const opencodeRel = `.opencode/commands/${name}.md`;
  const opencodeAbs = path.join(ROOT, ".opencode", "commands", `${name}.md`);
  entries.push({
    id: name,
    title: prettyTitle(name),
    description,
    path: `skills/${name}/SKILL.md`,
    install_cmd: `npx skills add MamounHisham1/vstack --skill ${name} -y`,
    trigger: `/${name}`,
    opencode_command: fs.existsSync(opencodeAbs) ? opencodeRel : null,
    plugin: "vstack",
  });
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 2) + "\n", "utf8");
console.log(`Wrote ${entries.length} skills to ${path.relative(ROOT, OUT_FILE)}`);
