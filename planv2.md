# Plan v2 — Prompt Suite Review & Optimization

> Status: **A-series + B1/B2 applied (2026-06-16).** Remaining: B3–B5 (structural token savings, optional).
> Date captured: 2026-06-15. Source of truth for model routing = `.github/prompts/manifest.json`.

## Context

Full read-through of all five worker prompts, the thin stubs, the manifest, and the
memory-adapter was completed. This is a functional/contextual review (Figma correctness +
token-usage), not just stylistic.

Already fixed during review:
- **README model-routing table** corrected to match the manifest/ODIN prompt (MODI escalation
  to Sonnet 4.6 was missing; VALI had a phantom Opus escalation). README now agrees with
  manifest ↔ ODIN prompt.

---

## A. Functional / Figma-correctness findings (change behavior)

Ordered by impact.

### A1. MIMR variant sampling can miss per-context token differences (HIGH)
- File: `.github/prompts/mimr/mimr.prompt.md` → "Variant sampling".
- Current: samples 1 variant per value of the **primary axis** (axis with most values), all
  other axes held at default.
- Problem: the token-bearing axis in FDS sets is usually a **semantic** axis
  (`Context = success/error/alert/info`), frequently NOT the largest axis. Holding it at
  default means error/alert/info fills are never audited → missing/wrong NV bindings are
  invisible.
- Fix: sample the **union of every axis's values** (one variant per distinct value across all
  axes), OR detect the color-bearing axis by scanning which axis actually changes `fills`,
  instead of assuming "largest = primary".

### A2. VALI ignores absolute positioning + wrap (HIGH — visible breakage)
- File: `.github/prompts/vali/vali.prompt.md` → Phase 2 conversion rules.
- Current: infers direction purely from child x/y spread; converts everything to flex flow.
- Problem: Figma AL supports `layoutPositioning: 'ABSOLUTE'` children (pinned badges,
  notification dots, overlay icons). Forcing them into flow visibly moves them. Wrapped layouts
  (`layoutWrap: 'WRAP'`) are also not recognized.
- Fix: detect `layoutPositioning === 'ABSOLUTE'` children and preserve (skip flow placement);
  recognize `layoutWrap === 'WRAP'` rather than guessing a single direction.

### A3. MIMR conflict detection compares names, not resolved values (MEDIUM)
- File: `.github/prompts/mimr/mimr.prompt.md` → "Conflict detection".
- Current: emits `⚠️ CONFLICT` when "last path segments differ".
- Problem: different names can resolve to the SAME value (false positive); same last segment
  can resolve DIFFERENTLY (missed conflict).
- Fix: compare **resolved values** as the primary test; use name divergence only as a
  secondary hint.

### A4. MODI placeholder + variant heuristics are fragile (MEDIUM)
- File: `.github/prompts/modi/modi.prompt.md`.
- Issues:
  - Placeholder detection = "RECTANGLE/ELLIPSE/FRAME, no children, text-like name". Misses the
    common wireframe pattern of a separate TEXT node labelling an unnamed shape. → also read an
    overlapping/sibling TEXT node as the name source.
  - Variant selection "closest to a known variant's default **size**" is near-random (FDS
    variants usually share dimensions, differ by color/state). → demote dimension heuristic to
    last resort; let name hints + interactive ask dominate.

### A5. SAGA per-variant CSS has no data source in standalone mode (MEDIUM)
- File: `.github/prompts/saga/saga.prompt.md` → Step 2 / Phase 4.4.
- Current: emits `:host(.error){ background: var(--fds-error-surface, …) }` per variant, but
  standalone SAGA only fetches `get_design_context` on the default node and reuses MIMR's NV map
  "when ODIN forwards it". Standalone → no per-variant fills → example values effectively
  hardcoded.
- Fix: state explicitly — fetch design context for one representative node **per variant value
  of the color-bearing axis**, OR require MIMR's `matrix`, before writing variant CSS.

### A6. SAGA: built-in TEXT vs slotted content ambiguous (LOW-MEDIUM)
- File: `.github/prompts/saga/saga.prompt.md`.
- Problem: unclear what happens to plain (non-instance) TEXT nodes that are part of the
  component (a built-in title) — markup or slot?
- Fix: one line — "internal TEXT → real markup with typography; only externally-supplied content
  → named slots".

### A7. Verify `mcp_figma_whoami` tool name (LOW — verify first)
- File: `.github/prompts/odin-9000/odin-9000.prompt.md` → §0b preflight.
- Risk: `mcp_figma_whoami` may not be a real Figma MCP tool (documented tools:
  get_design_context, get_metadata, get_screenshot, use_figma, …). If wrong, preflight fails on
  every cold start → users pushed into "sign in" branch needlessly.
- Action: confirm the actual tool name OR switch to a cheap `get_metadata` probe.

### A8. PAT plaintext in `.odin-session` (LOW — residual security)
- Gitignored (won't commit) but `figd_` token sits in plaintext in the working tree.
- Action: add a note recommending env var / OS keychain for shared machines; create file with
  restrictive perms.

---

## B. Token-usage findings (no behavior change)

Architecture is good (tiny manifest, lazy per-subagent load, script caching, digest path,
PRIOR_SCAN handoff). Waste is concentrated here:

### B1. MIMR literal duplication bug (QUICK WIN)
- File: `.github/prompts/mimr/mimr.prompt.md` → "REST supplemental pass".
- The `depth=1` and `depth={depth}` GET blocks repeat the identical "`plugin_data=shared` is
  mandatory" note back-to-back. Also an empty `### Write path (audit.figma.js + resolve.figma.js)`
  header with no body. Delete the dup + fill/remove the empty header.

### B2. "Critical rules" tables restate the body verbatim (BIGGEST SAVING)
- Files: SAGA especially (INSTANCE handling, CSS-var fallbacks, slots, boolean `?attr`,
  `::slotted`, no-chrome), also MODI/VALI.
- Nearly every rule is stated once inline and again in the table → ~doubles those sections.
- Fix: pick one home — keep the table as quick-reference, trim inline prose (or vice-versa).

### B3. Thin stub + full prompt indirection
- Each skill has both `prompts/<name>.prompt.md` (stub) and `prompts/<name>/<name>.prompt.md`
  (full); stub duplicates the entire long frontmatter `description`. Extra hop + risk of acting
  on the stub alone.
- Fix: collapse to one file per skill, OR make the stub a single line with no duplicated
  description.

### B4. Manifest vs frontmatter description duplication
- Manifest claims "intentionally tiny" but long descriptions also live in prompt frontmatter.
- Fix: keep manifest to one-line `role` + `loadWhen`; don't let long descriptions creep in.

### B5. Hercules 6-step boilerplate repeats in all five workers
- Could compress to ~2 lines + "see memory-adapter" and rely on the adapter defining
  `lesson.recall` / `episode.append` once.

---

## C. Consistency
- Model-routing facts now agree across manifest ↔ ODIN prompt ↔ README (post-fix). Keep the
  three in sync on any future routing change. **Manifest is source of truth.**

---

## Execution plan (suggested order for next session)

1. **Quick wins (no behavior change)**
   - [x] B1 — fix MIMR duplicated REST block + empty header.
   - [x] B2 — trim duplicated critical-rules prose (SAGA table trimmed; MODI/VALI tables already terse).
2. **Correctness (changes behavior — test against a real Figma frame after each)**
   - [x] A1 — MIMR sample across all axes / detect color-bearing axis.
   - [x] A2 — VALI absolute-positioning + wrap guard (prompt + `process.figma.js`).
   - [x] A3 — MIMR conflict-by-resolved-value.
3. **Verify-then-fix**
   - [x] A7 — `mcp_figma_whoami` confirmed non-existent; swapped to `get_metadata` probe.
4. **Remaining correctness**
   - [x] A4 — MODI placeholder TEXT-node detection + demote size heuristic (prompt + `scan-wireframe.figma.js` `textHint`).
   - [x] A5 — SAGA per-variant data source in standalone mode.
   - [x] A6 — SAGA internal-TEXT vs slot rule.
5. **Structural token savings (optional, larger refactor)**
   - [ ] B3 — collapse stub/full prompt indirection.
   - [ ] B4 — strip long descriptions from manifest/frontmatter overlap.
   - [ ] B5 — compress Hercules boilerplate across workers.
6. **Housekeeping**
   - [x] A8 — PAT storage note.
   - [ ] Re-verify C (manifest ↔ ODIN ↔ README) after any routing touch.

## Notes / guardrails
- All current working-tree edits remain **staged/uncommitted** per prior instruction — do not
  commit/push without asking.
- Every Figma write needs an `open → close` episode pair (Hercules rule). Prompt edits here are
  doc-only (no Figma writes), so no episode pair required for the editing work itself.
