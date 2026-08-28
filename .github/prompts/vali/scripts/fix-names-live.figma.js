/**
 * fix-names-live.figma.js — Fast deterministic default-name fix (detach-aware, instance-safe)
 *
 * Replaces the ad-hoc multi-round-trip flow (manual metadata probe → raw read-only walk →
 * eyeball the JSON → hand-write a detach/collapse/rename script → screenshot) that took
 * ~11 min on 2026-08-28 (Bonus card list, 189:18214). Codifies the exact procedure used
 * there into one script with a DRY_RUN/write gate, matching MIMR's scan-bind-live.figma.js
 * two-call pattern — target is ~2 min end to end.
 *
 * What it does, in order:
 *   1. Read-only scan from ROOT_ID, descending through INSTANCE boundaries (reading a
 *      nested instance's children is always allowed — only mutating them is not) to find
 *      every default-Figma-named node (`Frame 12`, `Group 3`, `Rectangle 1`, …) and every
 *      redundant single-child/no-pad/no-fill wrapper FRAME.
 *   2. Only detaches the INSTANCE ancestors that actually sit on the path to one of those
 *      findings — sibling instances with no issue underneath (e.g. a real `FDS-Badge`) are
 *      left completely alone, live and linked.
 *   3. Collapses redundant wrapper chains (a wrapper of a wrapper of a wrapper collapses in
 *      one pass, not one ungroup per level).
 *   4. Classifies + renames every surviving default-named FRAME to VALI's `{direction / role}`
 *      convention using the same structural rules as `data/layout-rules.md` (homogeneous
 *      family → pattern; 2+ distinctly-named subframes → section; 2+ same-named subframes →
 *      pattern; 1 subframe + leaf siblings → group; all leaves → pattern).
 *
 * ── Injected by agent before execution ──────────────────────────────────────
 *
 *   const ROOT_ID   = "189:18214";  // FRAME / INSTANCE / COMPONENT_SET node id to fix
 *   const DRY_RUN    = true;         // true = report only, zero mutation (even to instances)
 *   const MAX_DEPTH  = 30;           // safety cap on recursive descent
 *
 * ── Output ───────────────────────────────────────────────────────────────────
 *
 *   DRY_RUN=true (fully read-only — nothing is detached, collapsed, or renamed):
 *     { root:{id,name,type},
 *       wouldDetach: [{ id, name, path, looksLikeSharedComponent }],
 *       wouldCollapseCount, wouldRenameCount,
 *       wouldRenameSample: [{ oldName, newName }] (max 60) }
 *
 *   DRY_RUN=false:
 *     { root:{id,name,type} (id may differ from ROOT_ID if the root itself was detached),
 *       detachedCount, detached: [{ id, name }],
 *       collapsedCount, renamedCount, renamed: [{ id, oldName, newName }] }
 *
 * Never touches INSTANCE-internal nodes for rename/collapse — only FRAME wrapper structure
 * on the path that was actually detached. Never guesses a name for anything already
 * meaningfully named (only nodes matching the default-Figma-name pattern are touched).
 */

const DEFAULT_NAME_RE =
  /^(Frame|Group|Rectangle|Ellipse|Component|Vector|Line|Polygon|Star|Slice|Boolean)\s*\d*$/;

function isDefaultName(name) {
  return DEFAULT_NAME_RE.test((name || "").trim());
}

function looksLikeSharedComponent(name) {
  return /^fds[-_ ]/i.test((name || "").trim());
}

function isCollapseCandidate(n) {
  return (
    n.type === "FRAME" &&
    n.children &&
    n.children.length === 1 &&
    n.paddingTop === 0 &&
    n.paddingBottom === 0 &&
    n.paddingLeft === 0 &&
    n.paddingRight === 0 &&
    n.fills.length === 0 &&
    isDefaultName(n.name)
  );
}

function familyKey(n) {
  if (n.type === "INSTANCE") return "INSTANCE:" + (n.name || "").replace(/\s*\d+$/, "").trim();
  return n.type;
}

function classify(node) {
  const dir = node.layoutMode === "HORIZONTAL" ? "row" : "col";
  const children = node.children || [];
  if (children.length === 0) return `{${dir} / pattern}`;
  const keys = children.map(familyKey);
  if (keys.every((k) => k === keys[0])) return `{${dir} / pattern}`;
  const subframes = children.filter((c) => c.type === "FRAME");
  if (subframes.length >= 2) {
    const names = new Set(subframes.map((c) => c.name));
    if (names.size === subframes.length) return `{${dir} / section}`;
    if (names.size === 1) return `{${dir} / pattern}`;
    return `{${dir} / group}`;
  }
  if (subframes.length === 1 && children.length > 1) return `{${dir} / group}`;
  return `{${dir} / pattern}`;
}

// ── Read-only mirror (descends through INSTANCE boundaries — reading is always safe) ──

function mirror(node, depth) {
  const m = {
    id: node.id,
    name: node.name,
    type: node.type,
    layoutMode: "layoutMode" in node ? node.layoutMode : null,
    paddingTop: "paddingTop" in node ? node.paddingTop : 0,
    paddingBottom: "paddingBottom" in node ? node.paddingBottom : 0,
    paddingLeft: "paddingLeft" in node ? node.paddingLeft : 0,
    paddingRight: "paddingRight" in node ? node.paddingRight : 0,
    fills: "fills" in node && Array.isArray(node.fills) ? node.fills : [],
  };
  if ("children" in node && depth < MAX_DEPTH) {
    m.children = Array.from(node.children).map((c) => mirror(c, depth + 1));
  }
  return m;
}

function subtreeHasIssue(m) {
  if (isDefaultName(m.name) || isCollapseCandidate(m)) return true;
  if (m.children) return m.children.some(subtreeHasIssue);
  return false;
}

function simplify(m) {
  if (!m.children) return m;
  m.children = m.children.map(simplify).map((child) => {
    let cur = child;
    while (isCollapseCandidate(cur)) cur = cur.children[0];
    return cur;
  });
  return m;
}

function collectRenames(m, out) {
  if (m.type === "INSTANCE") return; // never touch instance internals
  if (m.type === "FRAME" && m.layoutMode && m.layoutMode !== "NONE" && isDefaultName(m.name)) {
    out.push({ id: m.id, oldName: m.name, newName: classify(m) });
  }
  if (m.children) for (const c of m.children) collectRenames(c, out);
}

function collectDetachTargets(m, path, out) {
  if (m.type === "INSTANCE" && subtreeHasIssue(m)) {
    out.push({ id: m.id, name: m.name, path: path.join(" > "), looksLikeSharedComponent: looksLikeSharedComponent(m.name) });
  }
  if (m.children) for (const c of m.children) collectDetachTargets(c, [...path, m.name], out);
}

// ── Main ─────────────────────────────────────────────────────────────────────

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) return JSON.stringify({ error: `Root "${ROOT_ID}" not found` });

if (typeof DRY_RUN === "undefined" || DRY_RUN) {
  const rootMirror = mirror(root, 0);
  const wouldDetach = [];
  collectDetachTargets(rootMirror, [], wouldDetach);
  const simplified = simplify(JSON.parse(JSON.stringify(rootMirror)));
  const renames = [];
  collectRenames(simplified, renames);

  // wouldCollapseCount: how many wrapper nodes disappear between the raw mirror and the
  // simplified one (count of default-named single-child/no-pad/no-fill frames anywhere).
  let wouldCollapseCount = 0;
  (function countCollapsible(m) {
    if (isCollapseCandidate(m)) wouldCollapseCount++;
    if (m.children) m.children.forEach(countCollapsible);
  })(rootMirror);

  return JSON.stringify({
    root: { id: root.id, name: root.name, type: root.type },
    wouldDetach,
    wouldCollapseCount,
    wouldRenameCount: renames.length,
    wouldRenameSample: renames.slice(0, 60),
  });
}

// ── Write pass ───────────────────────────────────────────────────────────────

let detachedCount = 0;
const detached = [];

function detachIfNeeded(node) {
  if (node.type === "INSTANCE") {
    const m = mirror(node, 0);
    if (!subtreeHasIssue(m)) return node; // leave untouched instance alone, live/linked
    const before = { name: node.name };
    node = node.detachInstance();
    detachedCount++;
    detached.push({ id: node.id, name: before.name });
  }
  if ("children" in node && node.children) {
    for (const child of Array.from(node.children)) detachIfNeeded(child);
  }
  return node;
}

const newRoot = detachIfNeeded(root);

let collapsedCount = 0;
function collapseAll(node) {
  if (node.type === "INSTANCE" || !("children" in node) || !node.children) return;
  for (const child of Array.from(node.children)) collapseAll(child);
  for (const child of Array.from(node.children)) {
    let cur = child;
    while (isCollapseCandidate(cur)) {
      const parent = cur.parent;
      const onlyChild = cur.children[0];
      const atIndex = parent.children.indexOf(cur);
      parent.insertChild(atIndex, onlyChild);
      cur.remove();
      cur = onlyChild;
      collapsedCount++;
    }
  }
}
collapseAll(newRoot);

let renamedCount = 0;
const renamed = [];
function renameAll(node) {
  if (node.type === "INSTANCE") return;
  if (node.type === "FRAME" && node.layoutMode && node.layoutMode !== "NONE" && isDefaultName(node.name)) {
    const oldName = node.name;
    const newName = classify(node);
    node.name = newName;
    renamed.push({ id: node.id, oldName, newName });
    renamedCount++;
  }
  if ("children" in node && node.children) for (const c of node.children) renameAll(c);
}
renameAll(newRoot);

return JSON.stringify({
  root: { id: newRoot.id, name: newRoot.name, type: newRoot.type },
  detachedCount,
  detached,
  collapsedCount,
  renamedCount,
  renamed,
});
