---
name: "modi"
description: "**FIGMA WORKFLOW SKILL** — MODI (Model-to-Object Design Instantiator): wireframe parsing and instance swapping. Resolves placeholder shapes to FDS library components and swaps existing instances to new versions with variant mapping. USE FOR: wireframe-to-component conversion; bulk instance replacement; component library scanning. NOT FOR: layout restructuring (use vali); token writes (use mimr). INPUTS NEEDED: {frame_url}."
agent: agent
argument-hint: "Figma frame URL or swap instruction"
---

## First Render
Always display this plain-text boot line at the start of the workflow:

```
[ MODI online · Model-to-Object Design Instantiator · wireframe & swap ]
```

# MODI — Model-to-Object Design Instantiator

## Hercules integration (run at start, every invocation)

1. Read `.github/prompts/manifest.json` and `.github/prompts/.hercules/memory-adapter.md`.
2. `lesson.recall(["modi"])` — honour returned lessons.
3. Open an episode if standalone: `episode.append({phase:"open", skill:"modi", summary})` (ODIN opens it when dispatched).
4. **Cache:** `data/component-map.md` is the Tier-A resolution cache — read first, append every new resolution.
5. On finish: `episode.append({phase:"close", skill:"modi", summary})` and `lesson.append(...)` for new resolutions worth caching (attach a `ruleProposal` against `data/component-map.md` when durable).

> **"Shape becomes component."**
> Transforms wireframe placeholders into real library instances, and swaps existing instances to newer versions — with full variant axis mapping.

## Purpose

An agentic component resolution and instance-swap tool for UX designers. MODI turns rectangles into real components and migrates existing instances to target variants, all without losing layout context.

Key roles:
- **Parse** — scan a wireframe frame, detect named placeholder shapes, resolve them to FDS library components, and swap in-place
- **Swap** — find all instances of a source component in a frame and replace them with a target component, mapping variant axes automatically
- **Scan** — pre-populate the component map from the design system library for instant resolution

| Mode | Trigger | Notes |
|---|---|---|
| **Parse** | user provides a wireframe frame URL | Detect placeholders → resolve → swap |
| **Swap** | user provides frame URL + "replace X with Y" | Find instances → map variants → swap |
| **Scan Library** | user requests component map population | Pre-scan named components into `component-map.md` |

---

## External files

| File | Purpose | Edit? |
|---|---|---|
| `data/component-map.md` | Component resolution cache — name → componentKey + variant axes | **Auto-updated by MODI** |
| `scripts/scan-wireframe.figma.js` | **Phase 1 — MANDATORY** wireframe tree scan; returns all RECTANGLE/ELLIPSE/FRAME placeholders and INSTANCE nodes | **Agent (read-only)** |
| `scripts/swap.figma.js` | **Phase 2 — MANDATORY** bulk swap engine; inject `SWAP_OPS` array | **Agent (read-only)** |

### Load-once rule

Read each script file **once per session** at the start. Cache the raw text in working memory. On every subsequent execution, prepend the injected constants block and run — do **not** re-read the file.

---

## Entry point — mode selection (MANDATORY on every invocation)

On every `/modi` invocation, start with `vscode_askQuestions`:

```json
{
  "questions": [{
    "header": "mode",
    "question": "What do you need?",
    "allowFreeformInput": true,
    "options": [
      { "label": "Parse wireframe", "description": "Detect placeholder shapes, resolve to FDS library components, swap in-place", "recommended": true },
      { "label": "Swap instances", "description": "Replace existing component instances with a different component" },
      { "label": "Scan library", "description": "Pre-populate component map from FDS design system" }
    ]
  }]
}
```

Then ask for the frame URL (parse/swap modes):

```json
{
  "questions": [{
    "header": "frame_url",
    "question": "Paste the Figma frame URL to process",
    "allowFreeformInput": true
  }]
}
```

For **Swap mode**, also ask:

```json
{
  "questions": [{
    "header": "swap_instruction",
    "question": "What should be replaced? (e.g. 'FDS-Input → FDS-Input-v2')",
    "allowFreeformInput": true
  }]
}
```

For **Scan Library mode**, ask:

```json
{
  "questions": [{
    "header": "components_to_scan",
    "question": "Which components to scan? (comma-separated, e.g. 'Input, Button, Badge, Banner')",
    "allowFreeformInput": true
  }]
}
```

---

## Slots

| Slot | Source | Format |
|---|---|---|
| `{frame_url}` | User | Full Figma URL |
| `{file_key}` | Extracted from URL | path segment after `/design/` |
| `{node_id}` | Extracted from URL `node-id` param | replace `-` → `:` |

---

## Component resolution — Hybrid strategy

MODI uses a three-tier fallback chain to resolve wireframe names to library components. Every successful resolution is cached to `data/component-map.md`.

### Tier A — Component map lookup (O(1))

Read `data/component-map.md`. If the wireframe name (case-insensitive, with common prefixes like `FDS-` stripped) matches an entry → use that componentKey directly.

### Tier B — Design system search

If no map match, call `mcp_figma_search_design_system` with the wireframe name. If found:
1. Fetch component details via `mcp_figma_get_design_context`
2. Extract componentKey + variant axes
3. Append to `data/component-map.md` under `## Discovered`
4. Use the resolved component

### Tier C — Ask user (interactive)

If both map and library search fail, prompt via `vscode_askQuestions`:

```json
{
  "questions": [{
    "header": "unresolved",
    "question": "No library match for '{name}'. Provide a source:",
    "allowFreeformInput": true,
    "options": [
      { "label": "Paste Figma URL", "description": "Provide a Figma URL to the component", "recommended": true },
      { "label": "Skip — leave placeholder", "description": "Keep the rectangle as-is" },
      { "label": "Skip all unknown", "description": "Don't ask again for unresolved shapes this run" }
    ]
  }]
}
```

- **URL provided** → fetch via `mcp_figma_get_design_context`, import, swap, append to map under `## Custom`
- **Skip** → leave placeholder, annotate with `⚠️ MODI: Unresolved — {name}`
- **Skip all** → set `SKIP_ALL_UNKNOWN = true` for the rest of the run; batch-annotate all skipped names at the end

---

## Variant mismatch resolution (interactive)

When swapping instances and source variant axes don't map 1:1 to target axes, ask **once per unique mismatch** (not per instance):

```json
{
  "questions": [{
    "header": "variant_mismatch",
    "question": "Source variant '{axis}={value}' has no match in {target}. Pick a target variant:",
    "allowFreeformInput": false,
    "options": [
      { "label": "{axis}={defaultValue}", "description": "Component default", "recommended": true },
      { "label": "{axis}={otherValue1}" },
      { "label": "{axis}={otherValue2}" },
      { "label": "Skip these instances", "description": "Leave instances with this variant unchanged" }
    ]
  }]
}
```

Rules:
- Asked **once per unique mismatch** — if 5 instances have `State=Error` and target lacks it, ask once, apply to all 5
- Mapping choices are cached for the duration of the run
- If no user input → use target component's **default variant**

---

## Phase 1 — Scan (ALWAYS use scripts)

> **⚠️ MANDATORY: Use `scripts/scan-wireframe.figma.js` for ALL discovery.**
> Never write ad-hoc Plugin API code to walk the tree or inspect nodes.
> The script handles node classification, batched scanning, and returns
> structured results at minimal context cost.

### Parse mode scan

The script identifies:
- **Placeholders** — RECTANGLE, ELLIPSE, or FRAME nodes with no children and a text-like name (e.g. "Input", "Button/Submit", "FDS-Badge")
- **Placeholder name fallback** — when a placeholder's own name is generic (`Rectangle`, `Ellipse`, `Frame N`, or a bare color/number), read an overlapping or sibling TEXT node as the name source: a TEXT node whose bounds sit inside the placeholder, or the nearest same-parent TEXT sibling. Use its characters as the resolution name before falling back to the layer name.
- **Instances** — existing INSTANCE nodes with their `mainComponent` reference and current variant properties
- **Layout context** — parent frame dimensions, positions, and auto-layout settings for sizing preservation

### Swap mode scan

The script finds all INSTANCE nodes in the subtree whose `mainComponent` belongs to the source component set. Returns each instance's:
- Node ID, position in parent, sizing
- Current variant property values (e.g. `{ Size: "Large", State: "Filled" }`)
- Parent context for post-swap sizing restoration

### Injection template

```js
const NODE_ID = "{node_id}";
const MODE = "parse";           // "parse" | "swap"
const SOURCE_KEY = null;        // swap mode: componentKey of source component set
// … paste scan-wireframe.figma.js content …
```

### Script output

```json
{
  "mode": "parse",
  "root": { "id": "...", "name": "...", "type": "FRAME" },
  "placeholders": [
    { "id": "...", "name": "Input", "type": "RECTANGLE", "w": 300, "h": 40, "textHint": "Email", "parentId": "...", "index": 0 }
  ],
  "instances": [
    { "id": "...", "name": "FDS-Input", "componentKey": "519c...", "variantProps": { "Size": "Medium" }, "parentId": "...", "index": 1 }
  ],
  "stats": { "total": 20, "placeholders": 5, "instances": 12, "other": 3 }
}
```

---

## Phase 2 — Resolve & Plan

### Parse mode

For each placeholder:
1. **Name parsing** — extract component name from wireframe layer name (or the overlapping/sibling TEXT fallback above):
   - Strip common prefixes: `FDS-`, `fds-`, `Fds-`
   - Split on `/` — first segment = component, rest = variant hint (e.g. `Button/Submit` → component: `Button`, hint: `Submit`)
   - Split on `\n` or ` - ` — treat as component name (wireframes often use multi-line or dash-separated names)
   - Case-insensitive matching against component map
2. **Resolve** using Tier A → B → C chain
3. **Variant selection** — if the map entry has variant axes, pick the closest match by priority:
   1. **Name hints** from the wireframe layer or TEXT fallback (e.g. `/Submit` → a variant with that label) — primary signal
   2. **Interactive ask** — `vscode_askQuestions` when hints are absent or ambiguous (never silently guess)
   3. **Placeholder dimensions** — closest to a known variant's default size, **last resort only** when no name hint exists and the user defers
   4. Default variant if all of the above yield nothing

### Swap mode

For each source instance:
1. Read current variant property values
2. Map each axis to the target component:
   - Exact name match → map directly
   - No match → trigger variant mismatch resolution (ask once, cache)
3. Find the target variant node that matches the mapped properties

### Plan confirmation (MANDATORY — ask before executing)

Present the swap plan via `vscode_askQuestions`:

```json
{
  "questions": [{
    "header": "confirm_plan",
    "question": "MODI swap plan — {count} operations:\n{summary_table}\n\nProceed?",
    "allowFreeformInput": false,
    "options": [
      { "label": "Execute all", "recommended": true },
      { "label": "Execute only exact matches", "description": "{exact_count}/{total_count} have full axis match" },
      { "label": "Cancel" }
    ]
  }]
}
```

---

## Phase 3 — Execute (ALWAYS use scripts)

> **⚠️ MANDATORY: Use `scripts/swap.figma.js` for ALL writes.**
> Never write ad-hoc Plugin API code to swap components, create instances, or modify nodes.
> The script handles batching, sizing preservation, override transfer, and error recovery.

### Injection template

```js
const NODE_ID = "{node_id}";
const SWAP_OPS = [
  // Parse mode: placeholder → component instance
  { op: "create", targetId: "{placeholder_node_id}", componentKey: "519c...", variantProps: { "Size": "Medium", "State": "Default" }, sizing: { h: "FILL", v: "HUG" } },
  // Swap mode: instance → new component variant
  { op: "swap", targetId: "{instance_node_id}", componentKey: "b47d...", variantProps: { "Size": "Large", "Type": "Primary" }, sizing: { h: "FILL", v: "HUG" } }
];
const CHUNK_SIZE = 50;
// … paste swap.figma.js content …
```

### Op types

| Op | Description |
|---|---|
| `create` | Replace a placeholder (RECTANGLE/FRAME) with a new component instance. Removes the placeholder, creates instance at same parent index, restores sizing. |
| `swap` | Call `node.swapComponent(targetVariant)` on an existing INSTANCE. Preserves compatible text/fill overrides. Logs any overrides that couldn't transfer. |

### Script output

```json
{
  "applied": 12,
  "failed": 0,
  "totalOps": 12,
  "log": [
    { "op": "create", "id": "new_id", "replaced": "Input [8914:78156]", "component": "FDS-Input", "variant": "Size=Medium" },
    { "op": "swap", "id": "8914:78160", "from": "FDS-Input/Medium", "to": "FDS-Input-v2/Medium" }
  ],
  "errors": []
}
```

---

## Scan Library mode

Pre-populate `data/component-map.md` with FDS library components.

### Flow

1. Parse user's component list (comma-separated names)
2. For each name:
   a. Call `mcp_figma_search_design_system` with the name
   b. Fetch component details via `mcp_figma_get_design_context` for the best match
   c. Extract: componentKey, variant axes (property names + allowed values), default variant key
3. Write all results to `data/component-map.md` under `## Core Kit`
4. Report: "Scanned {N} components, {M} added to map"

---

## Component map format (`data/component-map.md`)

```yaml
## Core Kit (pre-scanned)

- name: FDS-Input
  componentKey: "519c3267c04299f0db248c35091f533b70053e72"
  axes:
    Size: [Small, Medium, Large]
    State: [Default, Filled, Error, Disabled]
  defaultVariantKey: "b7357daba5a390783d8b9d8ade39005188694f80"
  scanned: 2026-04-27

- name: FDS-Button-Control-One
  componentKey: "b47d0f024c9e62a9f1ee8a0754c6675d53b5042f"
  axes:
    Size: [Small, Medium, Large]
    Type: [Primary, Secondary, Ghost]
    State: [Default, Hover, Pressed, Disabled]
  defaultVariantKey: "b864b18565f991e0ce44ff9818c378bc48054fe6"
  scanned: 2026-04-27

## Discovered (auto-appended by MODI)

## Custom (user-provided URLs)
```

### Staleness guard

Each entry has a `scanned:` date. If an entry is older than 30 days, MODI logs a warning:
`⚠️ Component map entry for {name} is {N} days old — consider re-scanning`

---

## REST API usage — minimize context window burn

MODI prioritizes the Figma REST API and Plugin API scripts over MCP design-context fetches to keep token costs low:

| Operation | Method | Why |
|---|---|---|
| **Tree scan** | `scan-wireframe.figma.js` (Plugin API) | Single call returns all nodes with type, name, dimensions, parent context — no MCP round-trips |
| **Component resolution** | `mcp_figma_search_design_system` | Lightweight search, returns component keys without full design context |
| **Variant axis discovery** | REST `GET /v1/components/{key}` with PAT | Returns component metadata including `variantGroupProperties` — tiny JSON response vs full `get_design_context` |
| **Bulk swap execution** | `swap.figma.js` (Plugin API) | Single script call processes all ops — no per-instance MCP calls |
| **Full design context** | `mcp_figma_get_design_context` | **Only** for Tier C custom components where the agent needs to understand structure |

### REST endpoints used

```
# Component metadata (variant axes, name, description)
GET https://api.figma.com/v1/components/{componentKey}
X-Figma-Token: {pat}

# Component set metadata (all variants at once)
GET https://api.figma.com/v1/component_sets/{componentSetKey}
X-Figma-Token: {pat}
```

These return ~1–2 KB JSON each — orders of magnitude smaller than a full `get_design_context` call.

---

## Auto-chain to VALI

After **Parse mode** completes, MODI optionally chains to VALI for layout formatting:

```json
{
  "questions": [{
    "header": "chain_vali",
    "question": "MODI swapped {N} components. Run VALI to format the layout?",
    "allowFreeformInput": false,
    "options": [
      { "label": "Yes — run VALI now", "description": "Convert to auto-layout + apply naming convention", "recommended": true },
      { "label": "No — I'll handle layout manually" }
    ]
  }]
}
```

If yes, invoke `/vali` with the same `{frame_url}`.

---

## Pipeline position (ODIN integration)

MODI runs **before** VALI in the full pipeline:

```
MODI → VALI → MIMR → SAGA
 ↑        ↑      ↑      ↑
 shapes   layout  tokens  code
```

ODIN decision logic:
- **Wireframe or placeholder shapes detected?** → run MODI first
- **Instance migration requested?** → run MODI first
- Then chain: VALI (layout) → MIMR (tokens) → SAGA (code)

---

## Critical rules

| Rule | Detail |
|---|---|
| **Scripts for all reads/writes** | Never write ad-hoc Plugin API code — use `scan-wireframe.figma.js` and `swap.figma.js` |
| **Component map is the cache** | Every successful resolution is persisted to `data/component-map.md` |
| **Ask on every unknown** | Tier C uses `vscode_askQuestions` — never guess a component mapping |
| **Variant mismatch = ask once** | Prompt user once per unique axis mismatch, cache the choice, apply to all matching instances |
| **Default variant fallback** | If no user input on mismatch, use target's default variant |
| **REST over MCP for metadata** | Use REST `GET /v1/components/{key}` for variant axes — not `get_design_context` |
| **Preserve sizing on swap** | Capture `layoutSizingHorizontal` + `layoutSizingVertical` before swap; restore after |
| **INSTANCE internals = read-only** | Never attempt to modify children of an INSTANCE node |
| **Skip all = batch annotate** | When user picks "Skip all unknown", collect all unresolved names and annotate them at the end |
| **Name parsing is generous** | Strip prefixes, split on `/`, `-`, `\n` — match case-insensitively against the component map |
| **Script load-once** | Read scripts once per session; cache content; prepend injection constants on reuse |
| **Never use `findOne` per-op** | Use `nodeCache` map built at startup |
| **Confirm before executing** | Always show the swap plan and ask for confirmation before Phase 3 |
| **Hercules run tracking** | `episode.append({phase:"open"})` before Phase 3; `episode.append({phase:"close"})` after the execution report |
