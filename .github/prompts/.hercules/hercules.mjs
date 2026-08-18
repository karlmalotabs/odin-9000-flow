#!/usr/bin/env node
/**
 * hercules.mjs — local backend for the Hercules memory adapter.
 *
 * Implements every verb described in `memory-adapter.md` (state / episode /
 * lesson / cache) plus the deterministic Tier-1 utilities (run-id, Figma URL
 * parsing, model resolution, PAT session handling) so the orchestrator and
 * skill prompts no longer perform this bookkeeping by hand in-context.
 *
 * Zero dependencies — Node >= 18, ESM. All `.hercules/` paths resolve relative
 * to this file, so the CLI works regardless of the caller's cwd.
 *
 *   node hercules.mjs <group> <verb> [args]
 *
 * JSON payload args may be passed inline or, when omitted / given as "-",
 * read from stdin (preferred for large or shell-unsafe objects).
 */

import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  mkdirSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERCULES_DIR = process.env.HERCULES_HOME
  ? resolve(process.env.HERCULES_HOME)
  : dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = resolve(HERCULES_DIR, "..");
const STATE_DIR = join(HERCULES_DIR, "state");
const CACHE_DIR = join(HERCULES_DIR, "cache");
const EPISODES = join(HERCULES_DIR, "episodes.jsonl");
const LESSONS = join(HERCULES_DIR, "lessons.jsonl");
const MANIFEST = join(PROMPTS_DIR, "manifest.json");

// ── helpers ─────────────────────────────────────────────────────────────────

function die(msg, code = 1) {
  process.stderr.write(`hercules: ${msg}\n`);
  process.exit(code);
}

function out(value) {
  process.stdout.write(
    typeof value === "string" ? value : JSON.stringify(value),
  );
  process.stdout.write("\n");
}

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

/** Resolve a JSON payload arg: inline string, or stdin when omitted / "-". */
function payload(arg) {
  const raw = arg === undefined || arg === "-" ? readStdin() : arg;
  if (!raw.trim()) die("expected a JSON payload (inline or via stdin)");
  try {
    return JSON.parse(raw);
  } catch (e) {
    die(`invalid JSON payload: ${e.message}`);
  }
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readJsonl(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch (e) {
        die(`corrupt JSONL at ${file}:${i + 1}: ${e.message}`);
      }
    });
}

/** Append one compact JSON object as a single line (preserves the JSONL invariant). */
function appendJsonl(file, obj) {
  // Guard against a prior write that left the file without a trailing newline.
  if (existsSync(file)) {
    const cur = readFileSync(file, "utf8");
    if (cur.length > 0 && !cur.endsWith("\n")) appendFileSync(file, "\n");
  }
  appendFileSync(file, JSON.stringify(obj) + "\n");
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function findRepoRoot(start) {
  let dir = start;
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// ── state ─────────────────────────────────────────────────────────────────

function stateRead(runId) {
  if (!runId) die("state read: missing <runId>");
  const file = join(STATE_DIR, `${runId}.json`);
  if (!existsSync(file)) return out({});
  out(readFileSync(file, "utf8").trim());
}

function stateWrite(runId, jsonArg) {
  if (!runId) die("state write: missing <runId>");
  const obj = payload(jsonArg);
  ensureDir(STATE_DIR);
  writeFileSync(
    join(STATE_DIR, `${runId}.json`),
    JSON.stringify(obj, null, 2) + "\n",
  );
  out({ ok: true, runId });
}

// ── episode ─────────────────────────────────────────────────────────────────

function episodeAppend(jsonArg) {
  const ev = payload(jsonArg);
  if (!ev.ts) ev.ts = new Date().toISOString();
  appendJsonl(EPISODES, ev);
  out({ ok: true, phase: ev.phase ?? null, runId: ev.runId ?? null });
}

// ── lesson ─────────────────────────────────────────────────────────────────

function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function lessonAppend(jsonArg) {
  const le = payload(jsonArg);
  if (!le.ts) le.ts = new Date().toISOString();
  if (le.applied === undefined) le.applied = false;
  appendJsonl(LESSONS, le);
  out({ ok: true, skill: le.skill ?? null });
}

function lessonRecall(skills) {
  if (!skills.length) die("lesson recall: provide at least one skill/tag");
  const wanted = new Set(skills.map(normalize));
  const hits = readJsonl(LESSONS).filter((le) => {
    if (wanted.has(normalize(le.skill))) return true;
    return (le.tags ?? []).some((t) => wanted.has(normalize(t)));
  });
  out(hits.map((h) => JSON.stringify(h)).join("\n"));
}

function lessonSweep(cap) {
  const pending = readJsonl(LESSONS).filter(
    (le) => le.applied !== true && le.ruleProposal != null,
  );
  // Collapse near-duplicates: same skill + ruleProposal.file + normalized lesson text.
  const seen = new Set();
  const unique = [];
  for (const le of pending) {
    const sig = `${normalize(le.skill)}|${normalize(le.ruleProposal.file)}|${normalize(le.lesson)}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    unique.push(le);
  }
  // Most-recent first, capped.
  unique.sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  const capped = unique.slice(0, cap);
  // Group by target data file.
  const groups = {};
  for (const le of capped) {
    const file = le.ruleProposal.file;
    (groups[file] ??= []).push(le);
  }
  out({ count: capped.length, totalPending: pending.length, groups });
}

/** True when every key/value in `matcher` is present (deep-equal) on `obj`. */
function matches(obj, matcher) {
  for (const [k, v] of Object.entries(matcher)) {
    if (typeof v === "object" && v !== null) {
      if (typeof obj[k] !== "object" || obj[k] === null) return false;
      if (!matches(obj[k], v)) return false;
    } else if (obj[k] !== v) {
      return false;
    }
  }
  return true;
}

function lessonUpdate(matcherArg, patchArg) {
  const matcher = payload(matcherArg);
  const patch = payload(patchArg);
  const lines = readJsonl(LESSONS);
  let changed = 0;
  const next = lines.map((le) => {
    if (!matches(le, matcher)) return le;
    changed++;
    return { ...le, ...patch };
  });
  if (changed === 0) die("lesson update: matcher matched no lines", 2);
  writeFileSync(LESSONS, next.map((o) => JSON.stringify(o)).join("\n") + "\n");
  out({ ok: true, updated: changed });
}

// ── cache ─────────────────────────────────────────────────────────────────

function cacheRead(key) {
  if (!key) die("cache read: missing <key>");
  const file = join(CACHE_DIR, `${key}.json`);
  if (!existsSync(file)) return out({});
  out(readFileSync(file, "utf8").trim());
}

function cacheWrite(key, jsonArg) {
  if (!key) die("cache write: missing <key>");
  const obj = payload(jsonArg);
  ensureDir(CACHE_DIR);
  writeFileSync(
    join(CACHE_DIR, `${key}.json`),
    JSON.stringify(obj, null, 2) + "\n",
  );
  out({ ok: true, key });
}

function cacheValid(key, ver) {
  if (!key || ver === undefined)
    die("cache valid: usage: cache valid <key> <ver>");
  const file = join(CACHE_DIR, `${key}.json`);
  if (!existsSync(file)) {
    out(false);
    process.exit(1);
  }
  const entry = JSON.parse(readFileSync(file, "utf8"));
  const valid = String(entry.version) === String(ver);
  out(valid);
  process.exit(valid ? 0 : 1);
}

// ── util: run-id ─────────────────────────────────────────────────────────────

function runId() {
  const d = new Date();
  const stamp =
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  out(`odin-${stamp}`);
}

// ── util: parse-figma-url ────────────────────────────────────────────────────

function parseFigmaUrl(url) {
  if (!url) die("util parse-figma-url: missing <url>");
  let u;
  try {
    u = new URL(url);
  } catch {
    die(`not a valid URL: ${url}`);
  }
  const parts = u.pathname.split("/").filter(Boolean);
  const kindIdx = parts.findIndex((p) =>
    ["design", "make", "board", "slides", "file", "proto"].includes(p),
  );
  if (kindIdx === -1) die(`unrecognised Figma URL shape: ${url}`);
  const kind = parts[kindIdx];
  let fileKey = parts[kindIdx + 1] ?? null;
  // Branch URLs: .../design/:fileKey/branch/:branchKey/... → use the branch key.
  const branchIdx = parts.indexOf("branch", kindIdx);
  if (branchIdx !== -1 && parts[branchIdx + 1]) fileKey = parts[branchIdx + 1];

  const rawNode = u.searchParams.get("node-id");
  const nodeId = rawNode ? rawNode.replace(/-/g, ":") : null;
  out({ kind, fileKey, nodeId });
}

// ── util: resolve-model ──────────────────────────────────────────────────────

function resolveModel(skill, escalate) {
  if (!skill) die("util resolve-model: missing <skill>");
  if (!existsSync(MANIFEST)) die(`manifest not found at ${MANIFEST}`);
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const routing = m.modelRouting ?? {};
  const key = normalize(skill);
  const isOrchestrator = key === "odin" || key === "orchestrator";
  const model = isOrchestrator
    ? (routing.orchestrator ?? null)
    : ((routing.defaults ?? {})[key] ?? null);
  if (!model) die(`no model configured for skill "${skill}"`, 2);
  const gate = routing.escalationSafetyGate ?? {};
  out({
    skill: key,
    model,
    runSubagent: `${model} (copilot)`,
    escalationRequested: !!escalate,
    escalationGateRequired: gate.required === true,
    gateRule: escalate ? (gate.rule ?? null) : null,
  });
}

// ── session (PAT file) ───────────────────────────────────────────────────────

function sessionPath() {
  const root = findRepoRoot(HERCULES_DIR) ?? PROMPTS_DIR;
  return join(root, ".odin-session");
}

function ensureGitignored(root) {
  const gi = join(root, ".gitignore");
  const entry = ".odin-session";
  const current = existsSync(gi) ? readFileSync(gi, "utf8") : "";
  if (current.split("\n").some((l) => l.trim() === entry)) return false;
  appendFileSync(
    gi,
    (current && !current.endsWith("\n") ? "\n" : "") + entry + "\n",
  );
  return true;
}

function sessionRead() {
  const file = sessionPath();
  if (!existsSync(file)) return out({ present: false });
  const fields = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    fields[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  out({
    present: true,
    pat: fields.PAT ?? null,
    frame: fields.LAST_FRAME ?? null,
  });
}

function sessionWrite(pat, frame) {
  if (!pat) die("session write: missing --pat <token>");
  const root = findRepoRoot(HERCULES_DIR) ?? PROMPTS_DIR;
  const added = ensureGitignored(root);
  const body = `PAT=${pat.trim()}\nLAST_FRAME=${(frame ?? "").trim()}\n`;
  writeFileSync(join(root, ".odin-session"), body, { mode: 0o600 });
  out({ ok: true, gitignoreUpdated: added });
}

function sessionClear() {
  const file = sessionPath();
  if (existsSync(file)) rmSync(file);
  out({ ok: true, cleared: true });
}

// ── dispatch ─────────────────────────────────────────────────────────────────

const [, , group, verb, ...rest] = process.argv;

const table = {
  state: {
    read: () => stateRead(rest[0]),
    write: () => stateWrite(rest[0], rest[1]),
  },
  episode: { append: () => episodeAppend(rest[0]) },
  lesson: {
    append: () => lessonAppend(rest[0]),
    recall: () => lessonRecall(rest),
    sweep: () => {
      const capArg = rest.indexOf("--cap");
      const cap = capArg !== -1 ? Number(rest[capArg + 1]) : 5;
      lessonSweep(Number.isFinite(cap) && cap > 0 ? cap : 5);
    },
    update: () => lessonUpdate(rest[0], rest[1]),
  },
  cache: {
    read: () => cacheRead(rest[0]),
    write: () => cacheWrite(rest[0], rest[1]),
    valid: () => cacheValid(rest[0], rest[1]),
  },
  util: {
    "run-id": () => runId(),
    "parse-figma-url": () => parseFigmaUrl(rest[0]),
    "resolve-model": () => resolveModel(rest[0], rest.includes("--escalate")),
  },
  session: {
    read: () => sessionRead(),
    write: () => {
      const patIdx = rest.indexOf("--pat");
      const frameIdx = rest.indexOf("--frame");
      sessionWrite(
        patIdx !== -1 ? rest[patIdx + 1] : undefined,
        frameIdx !== -1 ? rest[frameIdx + 1] : undefined,
      );
    },
    clear: () => sessionClear(),
  },
};

if (group === "--help" || group === undefined) {
  out(
    [
      "hercules.mjs — local Hercules memory backend",
      "usage: node hercules.mjs <group> <verb> [args]",
      "groups: state | episode | lesson | cache | util | session",
      "verbs:",
      "  state read <runId> | state write <runId> [json|-]",
      "  episode append [json|-]",
      "  lesson append [json|-] | lesson recall <skill...>",
      "  lesson sweep [--cap N] | lesson update <matcher> <patch>",
      "  cache read <key> | cache write <key> [json|-] | cache valid <key> <ver>",
      "  util run-id | util parse-figma-url <url> | util resolve-model <skill> [--escalate]",
      "  session read | session write --pat <token> [--frame <url>] | session clear",
    ].join("\n"),
  );
  process.exit(0);
}

const handler = table[group]?.[verb];
if (!handler)
  die(`unknown command: ${group} ${verb ?? ""}`.trim() + " (try --help)", 64);
handler();
