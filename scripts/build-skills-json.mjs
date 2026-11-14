#!/usr/bin/env node
// Build docs/data/skills.json from skills/*/SKILL.md frontmatter, then render
// the static skill table, install rows, and skill pickers. No dependencies.
// Run: node scripts/build-skills-json.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const OUT_FILE = path.join(ROOT, "docs", "data", "skills.json");
const INDEX_FILE = path.join(ROOT, "docs", "index.html");
const INSTALL_FILE = path.join(ROOT, "docs", "install.html");
const REPO_URL = "https://github.com/MamounHisham1/vstack";

// Human labels and short copy for the site. Fallback covers a new skill
// before its editorial line is written.
const LABELS = {
  "v-build": {
    name: "Build features",
    tag: "Build",
    short: "Build features end-to-end with parallel subagents. Decompose, fan out, review, merge, sync.",
  },
  "v-copy-me": {
    name: "Capture a workflow",
    tag: "Capture",
    short: "Turn a working session into a reusable skill. Capture the workflow while it is still fresh.",
  },
  "v-fill-me": {
    name: "Catch up",
    tag: "Catch up",
    short: "Catch up on uncommitted, unpushed, and recently merged work across branches and worktrees.",
  },
  "v-humanize": {
    name: "Rewrite plainly",
    tag: "Rewrite",
    short: "Rewrite long or technical output in plain language without losing the facts.",
  },
  "v-skill-creator": {
    name: "Create a skill",
    tag: "Create",
    short: "Scaffold, publish, and install a new v- skill with the repo's conventions.",
  },
};

function parseFrontmatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
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

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return ch;
    }
  });
}

function commandMarkup(command) {
  return escapeHtml(command).replace(
    / (--skill .*)$/,
    ' <span class="cmd-tail">$1</span>'
  );
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function metaFor(id) {
  return LABELS[id] || { name: prettyTitle(id), tag: "Skill", short: "" };
}

function renderSkillRow(entry, index) {
  const meta = metaFor(entry.id);
  const short = meta.short || entry.description;
  const id = escapeHtml(entry.id);
  const command = escapeHtml(entry.install_cmd);
  const search = [entry.id, meta.name, meta.tag, short, entry.trigger]
    .join(" ")
    .toLowerCase();
  const source = `${REPO_URL}/blob/main/${entry.path}`;

  return `<article class="skill-row" data-skill data-search="${escapeHtml(search)}">
  <div class="skill-no">${pad(index + 1)}</div>
  <div class="skill-main">
    <div class="skill-top"><code class="skill-id">${id}</code><span class="skill-tag">${escapeHtml(meta.tag)}</span></div>
    <h3>${escapeHtml(meta.name)}</h3>
    <p>${escapeHtml(short)}</p>
  </div>
  <div class="skill-side">
    <div class="skill-tags"><span>Single file</span><span>Slash command</span></div>
    <div class="skill-command"><code>${commandMarkup(entry.install_cmd)}</code><button type="button" class="copy-btn" data-copy="${command}" aria-label="Copy the install command for ${id}">Copy</button></div>
    <a class="skill-source" href="${escapeHtml(source)}">Source ↗</a>
  </div>
</article>`;
}

function renderInstallSkill(entry) {
  const meta = metaFor(entry.id);
  const short = meta.short || entry.description;
  const id = escapeHtml(entry.id);
  const command = escapeHtml(entry.install_cmd);
  const source = `${REPO_URL}/blob/main/${entry.path}`;

  return `<article class="install-skill">
  <div class="install-skill__head"><code class="install-skill__id">${id}</code><span class="install-skill__tag">${escapeHtml(meta.tag)}</span></div>
  <h3>${escapeHtml(meta.name)}</h3>
  <p>${escapeHtml(short)}</p>
  <div class="command"><code>${commandMarkup(entry.install_cmd)}</code><button type="button" class="copy-btn" data-copy="${command}" aria-label="Copy the install command for ${id}">Copy</button></div>
  <a class="install-skill__source" href="${escapeHtml(source)}">Open SKILL.md ↗</a>
</article>`;
}

function renderPickerOption(entry, index) {
  const meta = metaFor(entry.id);
  return `<option value="${escapeHtml(entry.id)}" data-command="${escapeHtml(entry.install_cmd)}"${index === 0 ? " selected" : ""}>${escapeHtml(entry.id)} / ${escapeHtml(meta.name)}</option>`;
}

function replaceBlocks(file, blocks) {
  let text = fs.readFileSync(file, "utf8");
  for (const [startMarker, endMarker, content] of blocks) {
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker, start === -1 ? 0 : start);
    if (start === -1 || end === -1) {
      throw new Error(`Missing build markers in ${path.relative(ROOT, file)}: ${startMarker} / ${endMarker}`);
    }
    text =
      text.slice(0, start + startMarker.length) +
      "\n" +
      content +
      "\n" +
      text.slice(end);
  }
  fs.writeFileSync(file, text, "utf8");
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

const rows = entries.map(renderSkillRow).join("\n");
const installRows = entries.map(renderInstallSkill).join("\n");
const options = entries.map(renderPickerOption).join("\n");

replaceBlocks(INDEX_FILE, [
  ["<!-- skills:start -->", "<!-- skills:end -->", rows],
  ["<!-- picker:start -->", "<!-- picker:end -->", options],
]);
replaceBlocks(INSTALL_FILE, [
  ["<!-- picker:start -->", "<!-- picker:end -->", options],
  ["<!-- install-skills:start -->", "<!-- install-skills:end -->", installRows],
]);

console.log(
  `Wrote ${entries.length} skills to ${[
    path.relative(ROOT, OUT_FILE),
    path.relative(ROOT, INDEX_FILE),
    path.relative(ROOT, INSTALL_FILE),
  ].join(", ")}`
);
