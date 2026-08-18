/**
 * hercules.test.mjs — unit tests for the local Hercules backend.
 *
 *   node --test .github/prompts/.hercules/hercules.test.mjs
 *
 * Each test runs the CLI in an isolated temp store via the HERCULES_HOME env
 * override, so the real episodes/lessons journals are never touched.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "hercules.mjs");

/** Run the CLI in an isolated store; returns trimmed stdout. */
function run(home, args, input) {
  return execFileSync("node", [CLI, ...args], {
    env: { ...process.env, HERCULES_HOME: home },
    input: input ?? "",
    encoding: "utf8",
  }).trim();
}

function tempHome() {
  return mkdtempSync(join(tmpdir(), "hercules-"));
}

test("state write then read round-trips", () => {
  const home = tempHome();
  const obj = { runId: "odin-x", goal: "test", plan: [{ skill: "mimr" }] };
  run(home, ["state", "write", "odin-x", "-"], JSON.stringify(obj));
  const read = JSON.parse(run(home, ["state", "read", "odin-x"]));
  assert.deepEqual(read, obj);
  rmSync(home, { recursive: true, force: true });
});

test("state read of unknown run returns empty object", () => {
  const home = tempHome();
  assert.deepEqual(JSON.parse(run(home, ["state", "read", "nope"])), {});
  rmSync(home, { recursive: true, force: true });
});

test("episode append writes one JSON object per line", () => {
  const home = tempHome();
  run(
    home,
    ["episode", "append", "-"],
    JSON.stringify({ runId: "r1", phase: "open" }),
  );
  run(
    home,
    ["episode", "append", "-"],
    JSON.stringify({ runId: "r1", phase: "close" }),
  );
  const lines = readFileSync(join(home, "episodes.jsonl"), "utf8")
    .split("\n")
    .filter(Boolean);
  assert.equal(lines.length, 2);
  lines.forEach((l) => assert.doesNotThrow(() => JSON.parse(l)));
  assert.equal(JSON.parse(lines[1]).phase, "close");
  rmSync(home, { recursive: true, force: true });
});

test("lesson recall matches by skill and by tag", () => {
  const home = tempHome();
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({ skill: "mimr", tags: ["padding"], lesson: "a" }),
  );
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({ skill: "vali", tags: ["layout"], lesson: "b" }),
  );
  const bySkill = run(home, ["lesson", "recall", "mimr"])
    .split("\n")
    .filter(Boolean);
  assert.equal(bySkill.length, 1);
  assert.equal(JSON.parse(bySkill[0]).lesson, "a");
  const byTag = run(home, ["lesson", "recall", "layout"])
    .split("\n")
    .filter(Boolean);
  assert.equal(byTag.length, 1);
  assert.equal(JSON.parse(byTag[0]).skill, "vali");
  rmSync(home, { recursive: true, force: true });
});

test("lesson sweep returns only pending proposals, deduped and grouped", () => {
  const home = tempHome();
  const dup = {
    skill: "mimr",
    lesson: "Use the audit script",
    applied: false,
    ruleProposal: { file: "mimr/data/rules.md" },
  };
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({ ...dup, ts: "2026-01-01T00:00:00Z" }),
  );
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({ ...dup, ts: "2026-02-01T00:00:00Z" }),
  ); // near-dup
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({
      skill: "vali",
      lesson: "wrap groups",
      applied: false,
      ruleProposal: { file: "vali/data/layout.md" },
    }),
  );
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({
      skill: "mimr",
      lesson: "already done",
      applied: true,
      ruleProposal: { file: "mimr/data/rules.md" },
    }),
  );
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({
      skill: "odin",
      lesson: "no proposal",
      applied: false,
      ruleProposal: null,
    }),
  );
  const sweep = JSON.parse(run(home, ["lesson", "sweep"]));
  assert.equal(
    sweep.count,
    2,
    "dedup collapses the two identical mimr proposals",
  );
  assert.equal(sweep.groups["mimr/data/rules.md"].length, 1);
  assert.equal(sweep.groups["vali/data/layout.md"].length, 1);
  rmSync(home, { recursive: true, force: true });
});

test("lesson sweep honours --cap", () => {
  const home = tempHome();
  for (let i = 0; i < 4; i++) {
    run(
      home,
      ["lesson", "append", "-"],
      JSON.stringify({
        skill: "s" + i,
        lesson: "l" + i,
        applied: false,
        ruleProposal: { file: "f" + i },
      }),
    );
  }
  const sweep = JSON.parse(run(home, ["lesson", "sweep", "--cap", "2"]));
  assert.equal(sweep.count, 2);
  assert.equal(sweep.totalPending, 4);
  rmSync(home, { recursive: true, force: true });
});

test("lesson update patches matched lines and preserves JSONL invariant", () => {
  const home = tempHome();
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({
      skill: "mimr",
      lesson: "x",
      applied: false,
      ruleProposal: { file: "f" },
    }),
  );
  run(
    home,
    ["lesson", "append", "-"],
    JSON.stringify({
      skill: "vali",
      lesson: "y",
      applied: false,
      ruleProposal: { file: "g" },
    }),
  );
  const res = JSON.parse(
    run(home, [
      "lesson",
      "update",
      JSON.stringify({ skill: "mimr" }),
      JSON.stringify({ applied: true, appliedAt: "2026-06-16T00:00:00Z" }),
    ]),
  );
  assert.equal(res.updated, 1);
  const lines = readFileSync(join(home, "lessons.jsonl"), "utf8")
    .split("\n")
    .filter(Boolean);
  assert.equal(lines.length, 2, "other line is untouched and still present");
  lines.forEach((l) => assert.doesNotThrow(() => JSON.parse(l)));
  const mimr = lines.map((l) => JSON.parse(l)).find((o) => o.skill === "mimr");
  assert.equal(mimr.applied, true);
  assert.equal(mimr.appliedAt, "2026-06-16T00:00:00Z");
  rmSync(home, { recursive: true, force: true });
});

test("cache valid compares version and sets exit code", () => {
  const home = tempHome();
  run(
    home,
    ["cache", "write", "k", "-"],
    JSON.stringify({ version: "v1", data: {} }),
  );
  assert.equal(run(home, ["cache", "valid", "k", "v1"]), "true");
  assert.throws(() => run(home, ["cache", "valid", "k", "v2"])); // non-zero exit
  rmSync(home, { recursive: true, force: true });
});

test("util run-id matches the odin-<yyyymmdd-hhmmss> shape", () => {
  const home = tempHome();
  assert.match(run(home, ["util", "run-id"]), /^odin-\d{8}-\d{6}$/);
  rmSync(home, { recursive: true, force: true });
});

test("util parse-figma-url extracts fileKey and converts node-id", () => {
  const home = tempHome();
  const r = JSON.parse(
    run(home, [
      "util",
      "parse-figma-url",
      "https://figma.com/design/ABC123/My-File?node-id=8866-76128&t=x",
    ]),
  );
  assert.equal(r.fileKey, "ABC123");
  assert.equal(r.nodeId, "8866:76128");
  rmSync(home, { recursive: true, force: true });
});

test("util parse-figma-url uses the branch key for branch URLs", () => {
  const home = tempHome();
  const r = JSON.parse(
    run(home, [
      "util",
      "parse-figma-url",
      "https://figma.com/design/ABC/branch/BR9/My-File?node-id=1-2",
    ]),
  );
  assert.equal(r.fileKey, "BR9");
  assert.equal(r.nodeId, "1:2");
  rmSync(home, { recursive: true, force: true });
});

test("util resolve-model reads the real manifest routing table", () => {
  // No HERCULES_HOME override → resolves the real manifest one dir up from the CLI.
  const mimr = JSON.parse(
    execFileSync("node", [CLI, "util", "resolve-model", "mimr"], {
      encoding: "utf8",
    }).trim(),
  );
  assert.equal(mimr.model, "Claude Sonnet 4.6");
  assert.equal(mimr.runSubagent, "Claude Sonnet 4.6 (copilot)");
  const odin = JSON.parse(
    execFileSync("node", [CLI, "util", "resolve-model", "odin"], {
      encoding: "utf8",
    }).trim(),
  );
  assert.equal(odin.model, "Claude Opus 4.8");
});

test("session write/read/clear round-trips and gitignores the file", () => {
  const home = tempHome();
  // No .git here → falls back to PROMPTS_DIR (home/..). Use a nested git root.
  const root = mkdtempSync(join(tmpdir(), "hercules-root-"));
  writeFileSync(join(root, ".gitignore"), "node_modules\n");
  const hh = join(root, ".github", "prompts", ".hercules");
  rmSync(home, { recursive: true, force: true });
  execFileSync("node", [
    "-e",
    `require('fs').mkdirSync(${JSON.stringify(hh)},{recursive:true});require('fs').mkdirSync(${JSON.stringify(join(root, ".git"))},{recursive:true})`,
  ]);
  run(hh, [
    "session",
    "write",
    "--pat",
    "figd_secret",
    "--frame",
    "https://figma.com/design/X/Y?node-id=1-2",
  ]);
  const read = JSON.parse(run(hh, ["session", "read"]));
  assert.equal(read.present, true);
  assert.equal(read.pat, "figd_secret");
  assert.equal(read.frame, "https://figma.com/design/X/Y?node-id=1-2");
  assert.match(
    readFileSync(join(root, ".gitignore"), "utf8"),
    /\.odin-session/,
  );
  run(hh, ["session", "clear"]);
  assert.equal(JSON.parse(run(hh, ["session", "read"])).present, false);
  rmSync(root, { recursive: true, force: true });
});
