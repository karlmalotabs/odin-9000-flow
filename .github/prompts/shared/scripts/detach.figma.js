/**
 * detach.figma.js — quick, no-reasoning instance detach
 *
 * Use whenever the user directly instructs "detach <node(s)>" (in any skill context — VALI,
 * HUGIN, MODI, …). Skips any read-only planning/analysis pass entirely — that reasoning is
 * what's slow. The user's instruction to detach IS the confirmation; just execute it.
 *
 * ── Injected by agent before execution ──────────────────────────────────────
 *
 *   const NODE_IDS      = ["189:18214"]; // one or more node ids to detach
 *   const CASCADE_DEPTH  = 0;             // 0 = detach only the given node(s)
 *                                        // N>0 = after detaching, also detach every
 *                                        // INSTANCE found among descendants, recursively,
 *                                        // up to N levels deeper (passes through non-
 *                                        // INSTANCE wrapper frames without spending depth
 *                                        // on them incorrectly — depth is only consumed
 *                                        // per detach, see below)
 *
 * ── Output ───────────────────────────────────────────────────────────────────
 *
 *   { results: [{ id, name, type, detached: true }, { id, error }, …], detachedTotal }
 *
 * `id` in a successful result is the NEW node id — `detachInstance()` always returns a node
 * with a different id than the original INSTANCE. If a requested id is not an INSTANCE, it is
 * reported with `detached: false` and left completely untouched (no error, no mutation) —
 * this is a no-op for anything that isn't already an instance, not a failure.
 */

function detachRecursive(node, depthRemaining, out) {
  if (node.type === "INSTANCE") {
    const detachedNode = node.detachInstance();
    out.push({ id: detachedNode.id, name: detachedNode.name, type: detachedNode.type, detached: true });
    node = detachedNode;
    depthRemaining -= 1; // one level of cascade consumed per actual detach
  }
  if (depthRemaining >= 0 && "children" in node && node.children) {
    for (const child of Array.from(node.children)) {
      detachRecursive(child, depthRemaining, out);
    }
  }
}

const results = [];
for (const id of NODE_IDS) {
  const node = await figma.getNodeByIdAsync(id);
  if (!node) {
    results.push({ id, error: "not found" });
    continue;
  }
  if (node.type !== "INSTANCE") {
    results.push({ id, name: node.name, type: node.type, detached: false });
    continue;
  }
  detachRecursive(node, CASCADE_DEPTH, results);
}

return JSON.stringify({ results, detachedTotal: results.filter((r) => r.detached).length });
