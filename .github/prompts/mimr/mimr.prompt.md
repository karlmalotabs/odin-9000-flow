---
name: "mimr"
description: "**FIGMA WORKFLOW SKILL** — MIMR (Metadata Inventory & Mapping Repository): hybrid two-pass audit combining REST fetch + Token Studio shared plugin data with Plugin API native variable resolution. Merged report with conflict detection, token suggestions from registry, bulk writes via mapping rules. USE FOR: auditing TS + NV bindings; detecting conflicts; bulk token migrations. NOT FOR: HTML/CSS code generation (use saga). INPUTS NEEDED: {frame_url} + {pat}."
agent: agent
argument-hint: "Figma frame URL"
---

## First Render

Always display this plain-text boot line at the beginning of the workflow:

```
[ MIMR online · Metadata Inventory & Mapping Repository · data & tokens ]
```

# MIMR — Metadata Inventory & Mapping Repository

## Hercules integration (run at start, every invocation)

1. Read `.github/prompts/manifest.json` and `.github/prompts/.hercules/memory-adapter.md`.
2. `lesson.recall(["mimr"])` — honour returned lessons (esp. async reads, cornerRadius single-call, var caching).
3. Open an episode if running standalone: `episode.append({phase:"open", skill:"mimr", summary})` (ODIN opens it when dispatched).
4. **Cache:** before resolving variables, `cache.read("vars-<fileKey>-<version>")`; reuse if `cache.valid`. After a fresh resolution, `cache.write` the `name→id` / short-name map keyed by the Figma file `version`.
5. **Librarian:** on a `token-registry.md` grep miss, dispatch the `librarian` subagent — never read `ts-core-fabric.json` directly.
6. On finish: `episode.append({phase:"close", skill:"mimr", summary})` and `lesson.append(...)` for any corrected token path / perf insight (attach a `ruleProposal` against `data/mapping-rules.md` when durable).

## Purpose

Audit, compare and bulk-update token bindings across Token Studio (TS) and native Figma variables (NV).

| Workflow            | Trigger                                                             | Phases       |
| ------------------- | -------------------------------------------------------------------- | ------------ |
| **Audit**           | user provides a Figma URL                                           | 1 → 1b → 2   |
| **Bulk update**     | "apply mapping rules" after an audit                                | 3            |
| **Fast bind (live)** | "convert/bind/sync TS to NV" as a direct action, or instances must not be skipped | scan-bind-live (see below) |

---

## External files

| File                                    | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Edit?                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `scripts/audit-resolve-digest.figma.js` | **Phase 1+1b — DEFAULT for audit-only runs.** Single-pass: tree walk + variable resolution + anomaly detection. Returns a pre-digested `{ summary, matrix, sizes, issues, varMap }`. Target output <8KB inline (avoids file-write threshold); typical 2-4KB for small components, 6-7KB for large COMPONENT_SETs. Eliminates file writes, python parsing, read_file chunks, and the separate resolve call. Use this unless Phase 3 (bulk write) is planned. | No                                                     |
| `scripts/audit.figma.js`                | Phase 1 — raw tree walk only. Use when Phase 3 writes are planned (bulk-update needs full node lists).                                                                                                                                                                                                                                                                                                                                                      | No                                                     |
| `scripts/resolve.figma.js`              | Phase 1b — variable resolution only. Use paired with audit.figma.js for write-path runs.                                                                                                                                                                                                                                                                                                                                                                    | No                                                     |
| `scripts/bulk-update.figma.js`          | Phase 3 — write engine (Plugin API), chunked in batches of 100                                                                                                                                                                                                                                                                                                                                                                                              | No                                                     |
| `scripts/generate-phase3.mjs`           | **Phase 3 script generator** — stamps a JSON write plan into a ready-to-run .figma.js script in ONE call. Eliminates iterative script building. Use this instead of manually assembling the script.                                                                                                                                                                                                                                                         | No                                                     |
| `scripts/scan-bind-live.figma.js`       | **Fast bind (live) — DEFAULT when the user asks to directly "convert/bind/sync TS to NV" rather than just audit.** Single call: walks the tree (with an `INCLUDE_INSTANCES` flag — set `true` to expand into instance-internal nodes instead of stopping at the INSTANCE boundary, set `false` to match stock audit behavior), resolves each TS token against local variables first, then falls back to `figma.teamLibrary` + `importVariableByKeyAsync` when the file has no local variables for a name, and binds directly. Call once with `DRY_RUN = true` for counts only (Phase 2 confirm gate), then again with `DRY_RUN = false` to write. Skip when Phase 2's full tree/matrix/issue report is actually needed — this script only returns counts + samples, not a full audit tree. | No |
| `data/token-registry.md`                | All available tokens — human-readable reference                                                                                                                                                                                                                                                                                                                                                                                                             | **User**                                               |
| `data/token-index.json`                 | All available tokens — compact machine index for agent lookups                                                                                                                                                                                                                                                                                                                                                                                              | **Auto-generated**                                     |
| `data/mapping-rules.md`                 | Bulk-update rules (YAML blocks)                                                                                                                                                                                                                                                                                                                                                                                                                             | **User**                                               |
| `data/ts-core-fabric.json`              | Raw Token Studio export — source for registry/index generation                                                                                                                                                                                                                                                                                                                                                                                              | **No — never load** (21K lines, context overflow risk) |
| `scripts/token-lookup.py`               | CLI tool to search ts-core-fabric.json — use `--batch` for multiple tokens in one call, `--decompose` for composite border tokens                                                                                                                                                                                                                                                                                                                           | No                                                     |

---

## Slots

| Slot              | Source                               | Format                        |
| ----------------- | ------------------------------------ | ----------------------------- |
| `{frame_url}`     | User                                 | Full Figma URL                |
| `{file_key}`      | Extracted from URL                   | path segment after `/design/` |
| `{node_id}`       | Extracted from URL `node-id` param   | replace `-` → `:`             |
| `{node_id_param}` | REST URL param                       | keep `-` (e.g. `21774-64113`) |
| `{pat}`           | User provides directly — never guess | `figd_xxxx…`                  |

**Before Phase 1:** verify `{frame_url}` and `{pat}`.
**Before Phase 3:** verify `data/mapping-rules.md` has at least one rule block.

---

## Fast bind (live) — direct "convert/bind TS to NV" requests

When the user's request is a direct write instruction rather than "audit this" — e.g. "convert TS
to NV", "bind TS to NV", "sync tokens to variables" — use `scripts/scan-bind-live.figma.js`
instead of the Phase 1 → 1b → 2 → 3 pipeline below. It collapses scan + resolve + bind into two
calls total:

1. **Dry run** — inject `DRY_RUN = true`, `INCLUDE_INSTANCES = <true|false per the request>`.
   Returns `{ stats, candidateCountByProp, candidateTotal, typography }` only — no writes. Show
   this table to the user and get a yes/no before writing (this is still the mandatory Phase 2
   confirm gate, just against a counts table instead of a full tree).
2. **Write** — same injection with `DRY_RUN = false`, plus `TYPOGRAPHY_KEY_MAP` populated per
   § Typography below if `typography.candidateTotal > 0`. Returns `{ applied, failed, notFound,
   notFoundByProp, notFoundSample, failedSample, typography }`.

**`INCLUDE_INSTANCES`** — ask (or infer from the request) whether instance-internal nodes should
be walked and bound:

- `true`: expand into every `INSTANCE`'s children too (writes become per-instance overrides on
  those nested node IDs). Required whenever the user says things like "don't skip/ignore
  instances", or when the root's direct children are themselves instances (a plain FRAME/SECTION
  wrapping placed components) — the stock digest scripts stop at the INSTANCE boundary and would
  audit nothing in that case.
- `false`: stop at the INSTANCE boundary, matching `audit-resolve-digest.figma.js`'s default
  read-only-instance behavior. Use this when the user just wants top-level/component-definition
  bindings touched, not every placed occurrence.

**Library fallback (automatic):** the script resolves each TS token against
`getLocalVariablesAsync()` first; if that returns nothing for a name (common for consumer files
whose tokens are all published from a team library, e.g. `[Lib]: FDS Design Tokens` / "Core
Brands"), it auto-falls-back to `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()`
+ `getVariablesInLibraryCollectionAsync()` + `importVariableByKeyAsync()`. If the dry-run
`candidateTotal` is large (100s+) and the target library isn't enabled in the file, that surfaces
as a near-100% `notFound` rate on the write call — check `figma.teamLibrary
.getAvailableLibraryVariableCollectionsAsync()` first if that happens and tell the user which
library needs enabling (Assets panel → Libraries) before retrying.

**When NOT to use this path:** if the user actually wants the full audit tree/matrix/conflict
report (Phase 2), use the normal `audit-resolve-digest.figma.js` flow — `scan-bind-live.figma.js`
only returns counts and samples, not a rendered tree.

### Typography — TS tokens bind to a Figma TEXT STYLE, not a variable

The TS namespace uses one key, `typography` (e.g. value `"Paragraphs.fds.fds-paragraphs-regular"`),
for every font/type-ramp token, and it always targets `node.textStyleId` on a `TEXT` node — never
`fontName`/`fontSize` directly and never a bound variable. `TS_TO_NV_PROP` deliberately excludes
`typography` — it is handled as its own pass in `scan-bind-live.figma.js` because styles resolve
differently from variables:

- **"Already bound" check:** `node.textStyleId !== ''` (not `boundVariables`).
- **No Plugin-API "get style by name"** exists (unlike variables, which have
  `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()`), so the agent — not the
  script — must resolve each distinct TS dot-path to its Figma style `key` before the write call.

**Procedure:**

1. **Dry run first** (`TYPOGRAPHY_KEY_MAP = {}`). Read `typography.distinctPaths` — this is
   almost always a short list (a handful of type-ramp entries), even when `typography.candidateTotal`
   itself is in the hundreds, because the same ramp step repeats across many nodes.
2. **Resolve each distinct path's style key.** Grep `data/token-index.json` first — typography
   rows follow the same `[shortName, tsPath, "typography", styleKey?, desc?]` schema as every
   other token type, except **the 4th field holds the Figma style `key` directly** (not an NV
   variable name — styles have no local/library name-lookup API, only `importStyleByKeyAsync(key)`).
   For any path missing a 4th field, call `search_design_system` with `includeStyles: true,
   includeComponents: false, includeVariables: false`, scoped to the FDS text-style library key
   (`lk-f1f39740f68a0938825ad9ac446f29cc51482c1a7219bd0434e34e69fe3062e1060180556b6e66ae32ddad4017fed27d3ab46603e5f691d7c171204e0c095893`),
   using the token's short name (e.g. `fds-paragraphs-lead-bold`). A single query commonly returns
   the whole sibling ramp (all weights/sizes in that family) in one call — capture all of them, not
   just the one you searched for.
3. **Write back what you resolved** into `data/token-index.json` (and the matching row in
   `data/token-registry.md`) before running the write pass — this is the whole point of the
   registry: the next run finds the key locally and skips `search_design_system` entirely.
4. **Write pass:** inject the assembled `TYPOGRAPHY_KEY_MAP = { "<dot.path>": "<style key>", ... }`
   alongside `DRY_RUN = false`. The script imports each style once (cached per key) and sets
   `node.textStyleId = style.id`.
5. Any distinct path still unresolved after step 2 is **left unbound and reported** in
   `typography.notFoundPaths` — never guess a close-enough style.

---

## Phase 1 — Discovery (ALWAYS use scripts)

> **⚠️ MANDATORY: Use `scripts/audit.figma.js` for ALL discovery.**
> Never write ad-hoc Plugin API code to walk the tree or inspect nodes.
> Never make multiple `getNodeByIdAsync` calls in a loop.
> **Script selection rule:**
>
> - **Audit-only (no writes planned)** → use `audit-resolve-digest.figma.js`. Single call, inline result, no file writes, no python parsing needed.
> - **Write-path (Phase 3 bulk-update planned)** → use `audit.figma.js` + `resolve.figma.js`. Full node lists are required by `bulk-update.figma.js`.
> - **Direct "convert/bind TS to NV" request** → use `scripts/scan-bind-live.figma.js` (see § Fast bind (live) above) instead of this pipeline.

### Script load (session-cached)

- **Digest path:** Read `scripts/audit-resolve-digest.figma.js` only if not already loaded this session. Cache under key `digest-script`.
- **Write path:** Read `scripts/audit.figma.js` under key `audit-script`; read `scripts/resolve.figma.js` under key `resolve-script`.

### Variant sampling

Before running either script, determine whether variant sampling is needed:

1. Use `get_metadata` (Figma MCP) or a shallow REST call with `depth=1` to read the node type and direct child count.
2. **If the root is a `COMPONENT_SET` with > 20 direct COMPONENT children:**
   - Read `variantGroupProperties` from the COMPONENT_SET.
   - **Sample the union of every axis's values** — for each axis, pick one variant per distinct
     value of that axis (other axes held at their default/first value). This guarantees a sample
     for every value of a _semantic_ axis (`Context = success/error/alert/info`,
     `Theme = surface/alternate-surface`), whose tokens differ per value. **Do not** sample only
     the largest axis — the token-bearing axis in FDS sets is usually semantic, not the largest,
     so holding it at default would leave error/alert/info fills unaudited.
   - When unsure which axis carries the tokens, detect the **color-bearing axis**: a cheap probe
     reads `fills` across one variant per axis value and picks the axis whose `fills` actually
     change. Always include every value of that axis in the sample.
   - Pass sampled IDs via `SAMPLE_IDS` injection slot.
3. **If ≤ 20 children** → set `SAMPLE_IDS = null` for full audit.

### Injection slots (both scripts share the same four constants)

Inject at the top of the script before execution:

```js
const ROOT_ID = "{node_id}";
const MAX_DEPTH = 4;
const SAMPLE_IDS = [{ sampled_ids }]; // null for full audit, or array of variant IDs
const PRIOR_SCAN = null; // or array of {id, type} from VALI scan (ODIN only)
```

**`PRIOR_SCAN` fast path (ODIN pipeline only):**
When ODIN runs VALI before MIMR, ODIN forwards the VALI scan as a `PRIOR_SCAN` array. Both scripts support this — they skip the tree walk and fetch only the listed node IDs. Leave `PRIOR_SCAN = null` for standalone MIMR runs.

### Script output — digest path

`audit-resolve-digest.figma.js` returns `{ root, stats, summary, varMap, matrix, sizes, issues, fromPriorScan }` as an inline result (no file written, always <3KB).

- `summary` — one-line stats string, use directly in Phase 2 header
- `matrix` — one row per Colour+Theme combo: `{ variant, n, fill_ts, fill_nv, border_ts, border_nv, text_fill_ts, text_fill_nv }`
- `sizes` — one row per Size: spacing, radius, stroke, typography tokens (TS + NV short names)
- `issues` — pre-detected anomalies: `{ code, severity, scope, detail, affectedCount }`. Issue codes: `MISSING_NV_FILL`, `RAW_REF_BORDER`, `RAW_REF_FILL`, `TS_NV_CONFLICT`, `MISSING_TS`, `SHARED_RADIUS`, `TYPOGRAPHY_SHARED`
- `varMap` — `{ varId: shortName }` **COLOR vars only** (structural FLOAT vars excluded — they are always clean and not needed for issue triage)

**When using the digest path, Phase 1b is skipped entirely** — variable resolution is done inline by the script.

### Script output — write path

`audit.figma.js` returns `{ root, variantGroupProperties, nodes, varIds, stats, fromPriorScan }`.

- Use `nodes` as Phase 1 results; use `varIds` as input to Phase 1b (`resolve.figma.js`).
- Output is written to disk (20KB cap). Read in line-range chunks via `read_file`.

### REST supplemental pass (optional)

Use a REST `depth=1` + `plugin_data=shared` pass **in addition to** the Plugin API when you need TS coverage for ALL variants (not just sampled ones). Run REST and Plugin API **in the same LLM turn** — they are independent.

```
GET https://api.figma.com/v1/files/{file_key}/nodes?ids={node_id_param}&plugin_data=shared&depth={depth}
X-Figma-Token: {pat}
```

`plugin_data=shared` is mandatory — without it `sharedPluginData` is silently absent.

**Depth parameter:**

- Default: omit `depth` (full tree)
- **For COMPONENT_SET with > 20 variants:** use `depth=3` + variant sampling
- For single frames or small components: omit `depth`

---

## Phase 1b — Variable resolution (write path only)

> **Skip this phase when using `audit-resolve-digest.figma.js`** — variable resolution is done inline by that script.
> Only run Phase 1b when `audit.figma.js` was used (write-path runs).

**Script load (session-cached):** Read `scripts/resolve.figma.js` only if not already loaded this session. Store the content in session memory under key `resolve-script`.

Inject at the top of the cached script content, then execute via `mcp_figma_use_figma`:

```js
const VAR_IDS = [
  /* allVarIds from Phase 1 */
];
const NODE_IDS = [
  /* ids where hasBoundVars === true */
];
```

Node resolution is batched internally (chunks of 50 via `Promise.all`). Use `fileKey = {file_key}`.

Merge returned `nodeBindings` into `results[]` by `node.id`, replacing `rawBoundVars` with `resolved`.

---

## Phase 2 — Merged report (STOP — confirm before any write)

### Digest path (audit-resolve-digest.figma.js)

The script returns the report pre-built. Render it directly — no additional parsing needed:

1. Print `summary` as the header line.
2. Render `sizes` as a table (Size · vPadding · hPadding · gap · radius · stroke · typography — TS and NV columns).
3. Render `matrix` as a table (Colour / Theme · n · fill_ts · fill_nv · border_ts · border_nv · text_fill_ts · text_fill_nv).
4. Render `issues` as a numbered list with severity emoji: ⚠️ warning / ❌ conflict / ℹ️ info.
5. Optionally list `varMap` entries (varId → shortName) for reference.

No tree traversal, no python, no file reads. The script has already done the analysis.

### Token registry lookup

**Never read `data/token-registry.md` in full — it is large and will fill the context window.**

Use this lookup strategy:

1. **grep_search first** — search `data/token-registry.md` by the token short name or partial TS path. This returns only matching rows at negligible cost.
2. **JSON index fallback** — if programmatic access is needed (e.g. to resolve NV from a TS path in a script), `require('data/token-index.json')`. Schema: `{ tokens: [[shortName, tsPath, type, nv?, desc?], ...] }`.
3. **Never load the full MD** — only use grep_search or the JSON index.

For every `⚠️ CONFLICT` row: grep the short name and surface the **canonical TS path** as a suggestion inline.

### Conflict detection

A conflict exists when a node has **both** TS and NV on the same logical property **and they
resolve to different values**. Compare **resolved values** as the primary test — name divergence
is only a secondary hint, because:

- Different token names can resolve to the **same** value (name-only comparison = false positive).
- The same last path segment can resolve to **different** values across collections/modes
  (name-only comparison = missed conflict).

**Procedure per shared property:**

1. Resolve the TS token to its value (via `token-index.json` / Librarian) and read the NV's
   resolved value (already in the digest's `resolved` field).
2. If both resolve and the values **differ** → emit `⚠️ CONFLICT`.
3. If a value cannot be resolved, fall back to comparing the **last path segments** and mark the
   row `⚠️ CONFLICT?` (unverified) rather than a hard conflict.

Logical-property pairing (which TS key maps to which NV property):

| TS key                                          | NV property                             |
| ----------------------------------------------- | --------------------------------------- |
| `paddingLeft` / `horizontalPadding` / `spacing` | `paddingLeft`, `paddingRight`           |
| `itemSpacing`                                   | `itemSpacing`                           |
| `borderRadius`                                  | `cornerRadius` / corner radius variants |
| `fill`                                          | `fills`                                 |
| `border`                                        | `strokes`                               |

### Tree format

```
Legend: 🎨 TS = Token Studio  📐 NV = Native variable  ∅ = no bindings  ⚠️ = conflict  🔒 = Instance (read-only, not expanded)

{RootName}  [{TYPE}]  {id}
├── {prop}  🎨 {ts.short}  |  📐 {nv.name}  [{nv.collection} · {nv.type}]                       ← TS+NV chain
├── {prop}  🎨 {ts.short}  |  📐 {nv.name}  [{nv.collection} · {nv.type}]  ⚠️ CONFLICT  → suggest: {canonical}
├── 🎨 {key}  →  {ts.short}                                                                       ← TS only
├── 📐 {prop}  →  {nv.name}  [{nv.collection} · {nv.type}]                                       ← NV only
├── 🔒 {name}  [INSTANCE]                                                                         ← instance leaf — not expanded
└── ∅
```

Append `(prop1/prop2/…)` when multiple native props share the same variable.
Legend printed once at the top.

**Truncation rules (apply when node count > 40):**

- **Collapse ∅ subtrees** — if a parent and all its descendants are `∅`, replace the entire subtree with a single `└── ∅ ({N} unbound children)` line.
- **Group identical siblings** — if 3 or more consecutive siblings have the exact same binding pattern, collapse to `├── {pattern}  ×{N}` and show only the first and last node names.
- **Cap depth at 4 levels** — beyond level 4, print `… ({N} deeper nodes, {M} with bindings)` and stop descending. If any deeper nodes have conflicts, note `{K} conflicts deeper` on the same line.
- Always show the full path for any node that has a `⚠️ CONFLICT` regardless of depth or grouping.

### Summary line

```
{total} nodes — {withTS} TS · {withNV} native · {conflicts} conflicts · {unbound} unbound
```

Then ask:

> **Do you want to write/update any bindings?**
> Options: (a) author rules in `data/mapping-rules.md` then say "apply mapping rules" · (b) describe a specific change now

### Option (b) — ad-hoc write from natural language

When the user describes a change directly (e.g. "update all Square nodes' gap to fds-spacing-const-gap-h-pattern"), derive a RULES entry without touching `mapping-rules.md`:

1. **Extract** from the description:
   - `layerPattern` — the layer name substring or exact name the user mentioned
   - `matchType` — `contains` (default) unless user says "exact" or gives a regex
   - `key` — the CSS/layout property (`fill`, `borderRadius`, `itemSpacing`, `paddingLeft`, etc.)
   - `value` — the TS token path; grep_search `data/token-registry.md` by the token name the user gave to confirm the exact path

2. **Show a derived rule preview** before executing:

   | Rule ID        | Layer Pattern    | Match         | Key     | Token Path |
   | -------------- | ---------------- | ------------- | ------- | ---------- |
   | `ad-hoc-{key}` | `{layerPattern}` | `{matchType}` | `{key}` | `{value}`  |

   Ask: **"Apply this rule? (yes/no)"**

3. On confirmation proceed directly to Phase 3 Step 3 — Execute, using the derived RULES array.

4. Do **not** write the ad-hoc rule back to `data/mapping-rules.md` unless the user explicitly asks to save it.

---

## Phase 3 — Bulk write (only after confirmation)

> **⚠️ MANDATORY: Use `scripts/bulk-update.figma.js` for ALL writes.**
> Never write ad-hoc Plugin API code to apply tokens, bind variables, or modify node properties.
> The script handles TS metadata, auto NV resolution, fill binding, chunked execution,
> and skip-if-already-bound logic. Ad-hoc code bypasses all of these safeguards.

> **Execution context:** `mcp_figma_use_figma` (Plugin API execution) is only available in the
> ODIN main session context — NOT in MIMR/VALI/SAGA subagent contexts. When MIMR is dispatched
> as a subagent, it builds the Phase 3 script and returns it to ODIN. ODIN then either executes
> the script via its own `use_figma` call, or instructs the user to paste the script in the
> Figma Plugin Console (Plugins → Development → Open Console).

> **Performance: use `generate-phase3.mjs` instead of building scripts manually.**
> Once you have the write plan (array of `{nodeId, prop, token, rawValue?, styleName?}`),
> generate the final script in ONE terminal call:
>
> ```bash
> echo '<write-plan-json>' | node .github/prompts/mimr/scripts/generate-phase3.mjs \
>   --root <rootNodeId> --file <fileKey> --out .github/prompts/mimr/scripts/phase3-<nodeId>.figma.js
> ```
>
> This replaces the old iterative 30+ turn script-assembly loop. Do NOT manually build
> the script line-by-line or read `bulk-update.figma.js` multiple times.

> **Performance: use `--batch` for token lookups.**
> When resolving multiple tokens, call `token-lookup.py` ONCE with `--batch`:
>
> ```bash
> python3 .github/prompts/mimr/scripts/token-lookup.py --batch "fds-info,fds-round-150,fds-spacing-200,..."
> ```
>
> This returns all results in one JSON object. Do NOT call token-lookup.py separately for
> each token — that creates one LLM round-trip per lookup.

### 1 — Parse rules

Read `data/mapping-rules.md`. Extract every fenced YAML block. Parse into a `RULES` array matching the shape in `scripts/bulk-update.figma.js`.

If a rule uses `type: "nv"` with a `varId` field, verify the `varId` string is a valid `VariableID:xxx` value — grep_search `data/token-registry.md` by token short name (column `Native Variable Name`) to confirm. If not found, stop and ask.

**For every `ts` write:** the script auto-resolves NV via `tsPathToNvName` + `getLocalVariablesAsync()` — no `rawValue` lookup is required in the registry. If you need to verify a token path exists, use grep_search on `data/token-registry.md` by short name.

> **Explicit `type: "nv"` writes are a manual override only.** The script auto-resolves NV for every `ts` write — you do not need to add `nv` entries for standard cases.

> **Writes are safe on already-bound nodes (append, don't overwrite).** For `ts` writes: the TS metadata is always updated, but an existing NV binding on the same property is never cleared — the script skips the rawValue fallback if an NV is already bound. This means bulk rules can be applied to a mixed set of nodes (some already bound, some not) without risk of regressing nodes that are correctly set up.

### 2 — Preview (mandatory)

| Rule ID | Layer Pattern     | Match     | Matched Nodes | Writes            |
| ------- | ----------------- | --------- | ------------- | ----------------- |
| `{id}`  | `{layer_pattern}` | `{match}` | N             | `{key} → {value}` |

Ask: **"Apply these N rules to X nodes? (yes/no)"**

### 3 — Execute

**Script load (session-cached):** Read `scripts/bulk-update.figma.js` only if not already loaded this session. Store the content in session memory under key `bulk-update-script`. On subsequent calls within the same session, read from session memory instead of the file.

Inject at the top of the cached script content:

```js
const ROOT_ID = "{node_id}"; // colon format
const RULES = [
  /* parsed rules */
];
// Optional fast-path cache (from cache.read("vars-<fileKey>-<version>")):
// const CACHE_VAR_IDS   = { "fds/fds-on-surface-low": "VariableID:…", … };
// const CACHE_STYLE_IDS = { "…/some-gradient": "S:…", … };
```

Execute via `mcp_figma_use_figma` with `fileKey = {file_key}`.

**Variable cache fast-path (perf):** if `cache.valid("vars-<fileKey>-<version>")`, inject its `name→id` maps as `CACHE_VAR_IDS` / `CACHE_STYLE_IDS`. The script then resolves ONLY the names it needs via `getVariableByIdAsync` and skips `getLocalVariablesAsync()` (500+ vars) and `getLocalPaintStylesAsync()` entirely. If the cache is stale or absent, omit the injection — the script falls back to a one-time full load and you should `cache.write` the resulting map.

**Auto-NV resolution** happens inside the script for every `ts` write:

1. The TS dot-path is converted to slash-name (`a.b.c` → `a/b/c`)
2. The variable is resolved by name — via `CACHE_VAR_IDS` + `getVariableByIdAsync` when injected, else `getLocalVariablesAsync()` (loaded once)
3. If found → `setBoundVariable` is called for each mapped prop (`borderRadius` → all 4 corners, etc.) — Figma resolves the value natively
4. If not found → `rawValue` is applied directly to the node style

**Fill handling — solid vs gradient:**

- **Solid fills:** excluded from auto-NV (`setBoundVariableForPaint` is needed); rawValue fallback applies the color.
- **Gradient fills (`-shade` / `-g` suffix):** TS tokens ending with `-shade` or `-g` are gradient paint styles, NOT variables. The script auto-detects these and applies via `node.fillStyleId = style.id`, resolving the style by name through `CACHE_STYLE_IDS` + `getStyleByIdAsync` when injected, else `getLocalPaintStylesAsync()`. No rawValue needed.

**Composite border handling (`type: "border"`):**

- Composite border tokens (e.g. `fds-stroke-const-int-active`) combine width + color. Figma has no composite border property — they must be decomposed into atomic width NV + color NV.
- Use `scripts/token-lookup.py "token-name" --type border --decompose` to resolve any composite border token.
- In the RULES array, use `{ type: "border", widthToken: "...", colorToken: "..." }` with the atomic TS paths from the decomposition table in `data/mapping-rules.md`.
- The script binds width to all 4 `strokeWeight` props and color via `setBoundVariableForPaint` on `strokes[0]`.
- Exception: `colorToken: "transparent"` sets a zero-opacity solid stroke (no variable).

### 4 — Audit log

| Result                                            | Count |
| ------------------------------------------------- | ----- |
| ✅ Applied                                        | N     |
| ✅ NV auto-bound                                  | N     |
| ✅ Component value updated                        | N     |
| ⚠️ Component value skipped (has NV / unparseable) | N     |
| ⚠️ Already same value                             | N     |
| ❌ Failed                                         | N     |

For each `nv-auto` entry with `status: 'ok'`, show: node name, prop, varName.
For each `component-value` entry with `status: 'ok'`, show: node name, key, rawValue applied.
For each `component-value` entry with `status: 'skipped'`, show: node name, key, reason.
List `status: 'error'` entries with `nodeId`, `rule`, `error`.

---

> **Component-type token rules** (buttons, headers, list items, elevation, border radius) are in [`data/mapping-rules.md`](data/mapping-rules.md).

---

## Critical rules

| Rule                                     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REST `node_id`                           | `-` separator in URL param, e.g. `21774-64113`. Plugin API: replace `-` → `:` in JS code                                                                                                                                                                                                                                                                                                                                                                                               |
| `plugin_data=shared`                     | Required — omitting silently drops `sharedPluginData`                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| TS namespace                             | Always `"tokens"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| TS value encoding                        | Stored as `'"token.path"'` — includes surrounding double-quotes                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `resolveLastSegment`                     | Split on `/`, take last; strip surrounding quotes first                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Variable ID prefix                       | Pass `VariableID:abc/123` as-is to `getVariableByIdAsync`                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Library variables                        | `getVariableByIdAsync` resolves local + library — always use it                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Null-guard children                      | Always `node.children ?? []`                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Confirm before write                     | Hard stop between Phase 2 and Phase 3 — no exceptions. **Padding writes require extra confirmation:** before applying any padding token (`paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight`, `verticalPadding`, `horizontalPadding`) to any COMPONENT or FRAME node, always stop and confirm with the user via `vscode_askQuestions`. Present the exact candidate token path(s) and the list of affected node ids/names. Do not proceed until explicit approval is received. |
| Phase 4 is opt-in                        | Never scaffold unless user explicitly requests it                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| PAT security                             | Never log or expose `{pat}` in any output                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Page switching                           | `await figma.setCurrentPageAsync(page)` — never assign `figma.currentPage =`                                                                                                                                                                                                                                                                                                                                                                                                           |
| Conflict vs chain                        | TS+NV on same property = direct-apply chain. Only `⚠️` when last segments differ                                                                                                                                                                                                                                                                                                                                                                                                       |
| Content fills                            | **Never omit.** After binding background fill on the COMPONENT, always bind `fds-on-*-hi` (or chosen emphasis) on every TEXT and `icon` VECTOR inside each variant. Omitting content fills is a checklist failure.                                                                                                                                                                                                                                                                     |
| `on-*` ≠ background                      | `fds-btn-on-surface-*`, `fds-on-btn-*`, `fds-on-surface-*` — all `on-*` tokens are content colours. **Never** apply them as a COMPONENT background fill.                                                                                                                                                                                                                                                                                                                               |
| Gradient fills (`-shade`/`-g`)           | TS tokens whose last path segment ends with `-shade` or `-g` are **gradient paint styles**, not NV variables. Figma variables only support solid colours. The `bulk-update.figma.js` script auto-detects these and applies via `fillStyleId`. In audit reports, gradient fills appear as `fillStyleId: "S:..."` instead of `boundVariables.fills`.                                                                                                                                     |
| Composite borders (`fds-stroke-const-*`) | Composite border tokens have `type: "border"` with `{width, color}` sub-values. **Never bind the composite token directly** — decompose into atomic width NV + color NV. Use `token-lookup.py --decompose` or the decomposition table in `data/mapping-rules.md`. In RULES, use `type: "border"` writes (not `type: "ts"`).                                                                                                                                                            |
| Token suggestions                        | Never guess a token path. Always use `grep_search` on `data/token-registry.md` by short name or partial TS path. Never read the full file.                                                                                                                                                                                                                                                                                                                                             |
| ts-core-fabric.json                      | **Never read or load** `data/ts-core-fabric.json` — it is 21K lines and will overflow the context window. Use `token-registry.md` (grep_search) or `token-index.json` instead. For composite token decomposition, use `scripts/token-lookup.py`.                                                                                                                                                                                                                                       |
| User input                               | **Always use `vscode_askQuestions` for any decision or confirmation needed from the user** — never use inline chat text. Specific decision points in `data/mapping-rules.md` provide the exact question + options; use those templates directly. For any unexpected decision not covered by a template, construct a `vscode_askQuestions` call on the spot.                                                                                                                            |
| Annotations                              | **Never use `setSharedPluginData` for annotations.** When `Annotations: True` is requested, write Figma native annotations via `node.setAnnotations([{ label, properties }])`. If `setAnnotations` is not available in the current API context, log a warning and skip — do not fall back to shared plugin data.                                                                                                                                                                       |
