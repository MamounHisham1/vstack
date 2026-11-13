#!/usr/bin/env node
// Build docs/data/skills.json from skills/*/SKILL.md frontmatter, then render
// the static catalog and install page from the same source. No dependencies.
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

// Short, human display names. Fallback covers a newly added skill before its
// label is written here.
const LABELS = {
  "v-build": { name: "Build features", note: "Parallel subagents to reviewed PRs" },
  "v-copy-me": { name: "Capture a workflow", note: "Turn a session into a reusable skill" },
  "v-fill-me": { name: "Catch up", note: "What changed across branches and worktrees" },
  "v-humanize": { name: "Rewrite plainly", note: "Technical output in human language" },
  "v-skill-creator": { name: "Create a skill", note: "Scaffold, publish, and install" },
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
  return LABELS[id] || { name: prettyTitle(id), note: "Agent skill" };
}

function renderIndexCard(entry, index) {
  const extra = metaFor(entry.id);
  const no = pad(index + 1);
  const featured = index === 0;
  const command = escapeHtml(entry.install_cmd);
  const id = escapeHtml(entry.id);
  const search = [entry.id, extra.name, extra.note, entry.description, entry.trigger]
    .join(" ")
    .toLowerCase();

  const open = `<button type="button" class="link-btn" data-open-card aria-label="Open the ${id} card">Open card <span aria-hidden="true">→</span></button>`;
  const copy = `<button type="button" class="copy-btn copy-btn--quiet" data-copy="${command}" aria-label="Copy the install command for ${id}">Copy install</button>`;
  const actions = featured
    ? `<div class="skill-card__actions">${open}</div>`
    : `<div class="skill-card__actions">${open}${copy}</div>`;
  const aside = featured
    ? `
  <div class="skill-card__aside">
    <p class="micro-label">Install</p>
    <div class="command command--dark">
      <code>${commandMarkup(entry.install_cmd)}</code>
      <button type="button" class="copy-btn" data-copy="${command}" aria-label="Copy the install command for ${id}">Copy</button>
    </div>
    <p class="skill-card__aside-note">Copy the command, or open the card for the full source.</p>
  </div>`
    : "";

  return `<article class="skill-card${featured ? " skill-card--featured" : ""}" role="listitem" data-skill-id="${id}" data-no="${no}" data-title="${escapeHtml(extra.name)}" data-description="${escapeHtml(entry.description)}" data-command="${command}" data-path="${escapeHtml(entry.path)}" data-trigger="${escapeHtml(entry.trigger)}" data-search="${escapeHtml(search)}">
  <span class="skill-card__tab" aria-hidden="true">${no}</span>
  <div class="skill-card__body">
    <p class="skill-card__kicker">vstack / skill card</p>
    <h3 class="skill-card__title"><span class="skill-card__id">${id}</span><span class="skill-card__name">${escapeHtml(extra.name)}</span></h3>
    <p class="skill-card__desc">${escapeHtml(entry.description)}</p>
    <ul class="skill-card__tags"><li>Single file</li><li>Slash command</li></ul>
    ${actions}
  </div>${aside}
</article>`;
}

function renderInstallRow(entry, index) {
  const extra = metaFor(entry.id);
  const no = pad(index + 1);
  const id = escapeHtml(entry.id);
  const command = escapeHtml(entry.install_cmd);

  return `<article class="skill-row">
  <div class="skill-row__head">
    <span class="skill-row__no" aria-hidden="true">${no}</span>
    <code class="skill-row__id">${id}</code>
  </div>
  <h3 class="skill-row__name">${escapeHtml(extra.name)}</h3>
  <p class="skill-row__desc">${escapeHtml(entry.description)}</p>
  <div class="command">
    <code>${commandMarkup(entry.install_cmd)}</code>
    <button type="button" class="copy-btn" data-copy="${command}" aria-label="Copy the install command for ${id}">Copy</button>
  </div>
</article>`;
}

function renderPickerOption(entry, index) {
  const extra = metaFor(entry.id);
  return `<option value="${escapeHtml(entry.id)}" data-command="${escapeHtml(entry.install_cmd)}"${index === 0 ? " selected" : ""}>${escapeHtml(entry.id)} / ${escapeHtml(extra.name)}</option>`;
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

const cards = entries.map(renderIndexCard).join("\n");
const rows = entries.map(renderInstallRow).join("\n");
const options = entries.map(renderPickerOption).join("\n");

replaceBlocks(INDEX_FILE, [
  ["<!-- catalog:start -->", "<!-- catalog:end -->", cards],
  ["<!-- picker:start -->", "<!-- picker:end -->", options],
]);
replaceBlocks(INSTALL_FILE, [
  ["<!-- skill-list:start -->", "<!-- skill-list:end -->", rows],
]);

console.log(
  `Wrote ${entries.length} skills to ${[
    path.relative(ROOT, OUT_FILE),
    path.relative(ROOT, INDEX_FILE),
    path.relative(ROOT, INSTALL_FILE),
  ].join(", ")}`
);
