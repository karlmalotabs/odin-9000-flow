/**
 * scan-bind-live.figma.js — Fast bulk TS→NV scan + bind (instance-aware, library-aware)
 *
 * Codifies the pattern used on 2026-08-17 across three live runs (114/114, 1899, 1809
 * candidates — 96-100% resolve rate) that replaced the audit-resolve-digest → confirm →
 * generate-phase3 → bulk-update round trip with a single combined call.
 *
 * Use this instead of audit-resolve-digest.figma.js / audit.figma.js + resolve.figma.js
 * + bulk-update.figma.js when:
 *   - The user asks to directly "convert/bind/sync TS to NV" (not just audit) and wants
 *     the fastest possible run, OR
 *   - INCLUDE_INSTANCES must be true (audit-resolve-digest / audit.figma.js hard-stop at
 *     every INSTANCE node and never expand into instance-internal children), OR
 *   - The file's tokens are NOT local variables (getLocalVariablesAsync() is empty) but
 *     come from a published team library — this script auto-falls-back to
 *     figma.teamLibrary + importVariableByKeyAsync, which the stock scripts do not do.
 *
 * Still respects the Phase 2 confirm-before-write gate: call once with DRY_RUN = true to
 * get counts only (no writes), show the user the candidateCountByProp table, get a yes/no,
 * then call again with DRY_RUN = false to actually bind.
 *
 * ── Injected by agent before execution ──────────────────────────────────────
 *
 *   const ROOT_ID            = "1:16968";  // FRAME / SECTION / COMPONENT_SET node ID
 *   const INCLUDE_INSTANCES  = true;       // false = stop at INSTANCE boundary (stock behavior)
 *   const DRY_RUN            = true;       // true = scan/count only, no writes
 *   const LIB_COLLECTION_KEYS = [];        // optional: known library collection keys to search
 *                                          // first (e.g. Core Brands / FDS Design Tokens =
 *                                          // "66ad3b0aae1fc6eaf0081f6af41af1d609b53150").
 *                                          // Leave [] to auto-discover via
 *                                          // getAvailableLibraryVariableCollectionsAsync().
 *
 * ── Output (inline JSON, no file write) ──────────────────────────────────────
 *
 *   DRY_RUN=true:
 *     { root, stats:{total,instances,withTS,withNV,both,unbound},
 *       candidateCountByProp:{fill,borderRadius,itemSpacing,borderColor,...}, candidateTotal }
 *
 *   DRY_RUN=false:
 *     { root, stats, pendingTotal, libVarCount, applied, failed, notFound,
 *       notFoundByProp, notFoundSample:[...max 40], failedSample:[...max 20] }
 *
 * Scope stays TS→NV binding only: no new tokens created, no rawValue writes, no value
 * changes on nodes that already carry the correct NV. Bind targets not resolvable to any
 * variable (raw literals like "1.5", tokens like "border-radius.small" absent from every
 * available library) are left untouched and reported in notFoundSample — never guessed.
 */

const TS_NS = 'tokens';

const TS_TO_NV_PROP = {
  fill: ['fills', 'fillStyleId'],
  borderColor: ['strokes'],
  borderRadius: ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius', 'cornerRadius'],
  itemSpacing: ['itemSpacing'],
  spacing: ['itemSpacing'],
  horizontalPadding: ['paddingLeft', 'paddingRight'],
  verticalPadding: ['paddingTop', 'paddingBottom'],
  borderWidth: ['strokeTopWeight', 'strokeWeight'],
};

function getTS(node) {
  const ts = {};
  try {
    const keys = node.getSharedPluginDataKeys(TS_NS);
    for (const k of keys) {
      const raw = node.getSharedPluginData(TS_NS, k);
      if (!raw) continue;
      ts[k] = raw.replace(/^"|"$/g, '');
    }
  } catch (_) {}
  return Object.keys(ts).length ? ts : null;
}

function getNV(node) {
  const nv = {};
  try {
    const bv = node.boundVariables;
    if (bv) {
      for (const prop of Object.keys(bv)) {
        const b = bv[prop];
        if (!b) continue;
        if (Array.isArray(b)) {
          const ids = b.filter((x) => x?.id).map((x) => x.id);
          if (ids.length) nv[prop] = ids;
        } else if (b.id) {
          nv[prop] = b.id;
        }
      }
    }
  } catch (_) {}
  try {
    if (node.fillStyleId && typeof node.fillStyleId === 'string' && node.fillStyleId.length > 0) {
      nv.fillStyleId = node.fillStyleId;
    }
  } catch (_) {}
  return Object.keys(nv).length ? nv : null;
}

function hasAnyNv(nv, props) {
  if (!nv) return false;
  return props.some((p) => nv[p] !== undefined);
}

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) return JSON.stringify({ error: `Root "${ROOT_ID}" not found` });

// ── Tree walk (respects INCLUDE_INSTANCES) ──────────────────────────────────

const stats = { total: 0, instances: 0, withTS: 0, withNV: 0, both: 0, unbound: 0 };
const candidateCountByProp = {};
const pending = []; // { node, tsKey, tsVal }

function visit(node, depth) {
  if (depth > 40) return;
  stats.total++;
  const isInstance = node.type === 'INSTANCE';
  if (isInstance) stats.instances++;

  const ts = getTS(node);
  const nv = getNV(node);
  if (ts) stats.withTS++;
  if (nv) stats.withNV++;
  if (ts && nv) stats.both++;
  if (!ts && !nv) stats.unbound++;

  if (ts) {
    for (const [tsKey, tsVal] of Object.entries(ts)) {
      const nvProps = TS_TO_NV_PROP[tsKey];
      if (!nvProps) continue;
      if (!hasAnyNv(nv, nvProps)) {
        candidateCountByProp[tsKey] = (candidateCountByProp[tsKey] || 0) + 1;
        pending.push({ node, tsKey, tsVal });
      }
    }
  }

  // Stock scripts stop here for INSTANCE nodes. This script only stops if the
  // agent explicitly asked to preserve that (read-only-instance) behavior.
  if (isInstance && !INCLUDE_INSTANCES) return;

  if ('children' in node && node.children) {
    for (const child of node.children) visit(child, depth + 1);
  }
}
visit(root, 0);

const candidateTotal = Object.values(candidateCountByProp).reduce((a, b) => a + b, 0);

if (typeof DRY_RUN === 'undefined' || DRY_RUN) {
  return JSON.stringify({
    root: { id: root.id, name: root.name, type: root.type },
    stats,
    candidateCountByProp,
    candidateTotal,
  });
}

// ── Variable resolution: local first, then team library fallback ───────────

const localVars = await figma.variables.getLocalVariablesAsync();
const byName = {};
for (const v of localVars) byName[v.name] = { source: 'local', variable: v };

if (Object.keys(byName).length === 0 || (typeof LIB_COLLECTION_KEYS !== 'undefined' && LIB_COLLECTION_KEYS.length)) {
  let keys = typeof LIB_COLLECTION_KEYS !== 'undefined' ? LIB_COLLECTION_KEYS : [];
  if (!keys.length) {
    try {
      const cols = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      keys = cols.map((c) => c.key);
    } catch (_) {}
  }
  for (const k of keys) {
    try {
      const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(k);
      for (const v of vars) {
        if (!byName[v.name]) byName[v.name] = { source: 'library', key: v.key };
      }
    } catch (_) {}
  }
}

function findEntry(tsPath) {
  const slash = tsPath.replace(/\./g, '/');
  if (byName[slash]) return byName[slash];
  const noVarPrefix = slash.replace(/^var\//, '');
  if (byName[noVarPrefix]) return byName[noVarPrefix];
  const segs = slash.split('/');
  if (segs.length >= 2) {
    const suffix2 = segs.slice(-2).join('/');
    for (const [k, entry] of Object.entries(byName)) {
      if (k === suffix2 || k.endsWith('/' + suffix2)) return entry;
    }
  }
  const last = segs[segs.length - 1];
  const cands = Object.entries(byName).filter(([k]) => k === last || k.endsWith('/' + last));
  if (cands.length === 1) return cands[0][1];
  return null;
}

const _importCache = {};
async function resolveVariable(entry) {
  if (entry.source === 'local') return entry.variable;
  if (_importCache[entry.key]) return _importCache[entry.key];
  try {
    const v = await figma.variables.importVariableByKeyAsync(entry.key);
    _importCache[entry.key] = v;
    return v;
  } catch (_) {
    return null;
  }
}

// ── Bind helpers ─────────────────────────────────────────────────────────────

function bindPaintProp(node, prop, variable) {
  try {
    const paints = node[prop] ? node[prop].slice() : [];
    if (paints.length === 0) paints.push(figma.util.solidPaint('#000000'));
    paints[0] = figma.variables.setBoundVariableForPaint(paints[0], 'color', variable);
    node[prop] = paints;
    return true;
  } catch (_) {
    return false;
  }
}
function bindCornerRadius(node, variable) {
  try {
    for (const p of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
      if (p in node) node.setBoundVariable(p, variable);
    }
    return true;
  } catch (_) {
    return false;
  }
}
function bindScalar(node, prop, variable) {
  try {
    node.setBoundVariable(prop, variable);
    return true;
  } catch (_) {
    return false;
  }
}

// ── Apply ────────────────────────────────────────────────────────────────────

const report = { applied: 0, failed: 0, notFound: 0 };
const notFoundByProp = {};
const notFoundSample = [];
const failedSample = [];

for (const { node, tsKey, tsVal } of pending) {
  const entry = findEntry(tsVal);
  if (!entry) {
    report.notFound++;
    notFoundByProp[tsKey] = (notFoundByProp[tsKey] || 0) + 1;
    if (notFoundSample.length < 40) notFoundSample.push({ id: node.id, name: node.name, tsKey, tsPath: tsVal });
    continue;
  }
  const variable = await resolveVariable(entry);
  if (!variable) {
    report.notFound++;
    notFoundByProp[tsKey] = (notFoundByProp[tsKey] || 0) + 1;
    if (notFoundSample.length < 40) notFoundSample.push({ id: node.id, name: node.name, tsKey, tsPath: tsVal, reason: 'import_failed' });
    continue;
  }

  let ok = false;
  if (tsKey === 'fill') ok = bindPaintProp(node, 'fills', variable);
  else if (tsKey === 'borderColor') ok = bindPaintProp(node, 'strokes', variable);
  else if (tsKey === 'borderRadius') ok = bindCornerRadius(node, variable);
  else if (tsKey === 'itemSpacing' || tsKey === 'spacing') ok = bindScalar(node, 'itemSpacing', variable);
  else if (tsKey === 'horizontalPadding') {
    try {
      node.setBoundVariable('paddingLeft', variable);
      node.setBoundVariable('paddingRight', variable);
      ok = true;
    } catch (_) {
      ok = false;
    }
  } else if (tsKey === 'verticalPadding') {
    try {
      node.setBoundVariable('paddingTop', variable);
      node.setBoundVariable('paddingBottom', variable);
      ok = true;
    } catch (_) {
      ok = false;
    }
  } else if (tsKey === 'borderWidth') {
    try {
      for (const p of ['strokeTopWeight', 'strokeBottomWeight', 'strokeLeftWeight', 'strokeRightWeight']) {
        if (p in node) node.setBoundVariable(p, variable);
      }
      ok = true;
    } catch (_) {
      ok = false;
    }
  }

  if (ok) report.applied++;
  else {
    report.failed++;
    if (failedSample.length < 20) failedSample.push({ id: node.id, name: node.name, tsKey, tsPath: tsVal });
  }
}

return JSON.stringify({
  root: { id: root.id, name: root.name, type: root.type },
  stats,
  pendingTotal: pending.length,
  libVarCount: Object.keys(byName).length,
  applied: report.applied,
  failed: report.failed,
  notFound: report.notFound,
  notFoundByProp,
  notFoundSample,
  failedSample,
});
