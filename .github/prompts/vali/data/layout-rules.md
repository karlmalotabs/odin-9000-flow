# Layout Rules
<!-- schema-version: 1 -->

Rules for classifying and converting Figma layers into semantic auto-layout frames.
Used by: **VALI** (Phase 2 + 3).
Token mapping consumed by: **MIMR**.

---

## 1. Direction detection

When converting a GROUP with no existing `layoutMode`, infer direction from child positions:

| Condition | Direction |
|---|---|
| Children share roughly the same `x` (within 8px), `y` values spread | `VERTICAL` (`{col}`) |
| Children share roughly the same `y` (within 8px), `x` values spread | `HORIZONTAL` (`{row}`) |
| Mixed — neither axis dominant | `VERTICAL` (default) |

---

## 2. Role classification

Determined **structurally** — look only at direct children, no token data required.

### Decision order (apply top-down, stop at first match)

#### 1. Homogeneous check → **pattern**
If all direct children belong to the same semantic family, the frame is a **pattern** — regardless of whether the children contain sub-frames.

- All children are the same `type` AND (if INSTANCE) share the same component base name (strip trailing numbers / variant suffixes)
- Examples: 5×`FDS-Input`, 6×`FDS-Payment Chip`, 3×`Radio Button Set`, 2×`FDS-Input` side-by-side
- **Applies even when sub-frames exist inside those children** — look only at the direct child level

#### 2. Broken-pattern check → **group** (see Section 3 for wrapping)
If children are mostly the same family but broken by one or more semantically different components:

- The contiguous same-type runs should each be wrapped in their own `{col / pattern}` (or `{row / pattern}`)
- The parent then becomes a **group** over those wrapped patterns + the interrupting component
- Example: `FDS-Input, FDS-Input, Gender, FDS-Input, FDS-Input, FDS-Input` → wrap top 2 into `{col / pattern}`, wrap bottom 3 into `{col / pattern}`, parent = `{col / group}`

#### 3. Sub-frame count check
| Condition | Role |
|---|---|
| 2+ sub-frames with **distinct names** (semantic content blocks) | **section** |
| 2+ sub-frames with the **same name** (repeating rows) | **pattern** |
| 1 sub-frame + ≥1 leaf sibling (e.g. label TEXT + input FRAME) | **group** |
| All children are leaves (TEXT, INSTANCE, RECTANGLE, COMPONENT, VECTOR…) | **pattern** |

> **`section` is strict** — it requires genuinely named, semantically distinct blocks (e.g. `Personal Details` + `Contact Details`). Two frames with the same name or from the same component family do NOT qualify as a section.

> **Leaf node types:** RECTANGLE, TEXT, INSTANCE, COMPONENT, VECTOR, ELLIPSE, POLYGON, STAR, LINE

> **COMPONENT_SET scan with zero GROUPs and all COMPONENT children already non-`NONE` `layoutMode`:** classify the run as **property-only** — emit only sizing/slot-AL property corrections, no structural OPS. Note: Figma 2025+ SLOT nodes inside a COMPONENT are writable (unlike INSTANCE internals), so a slot-level fix is still in scope even in a property-only run.

---

## 3. Wrapping rules (agent may create new AL frames)

The agent is **permitted and encouraged** to create new auto-layout frames to normalize a layout before classifying or tokenizing it.

### When to wrap

| Situation | Action |
|---|---|
| A contiguous run of same-family siblings is broken by a different component | Wrap each contiguous run into `{col / pattern}` (or `{row / pattern}`), making the parent a `{col / group}` |
| A loose INSTANCE sits as a direct child of a COMPONENT alongside other named FRAME siblings | Wrap the loose INSTANCE into a new `{col / pattern}` at the same index |
| A pattern frame contains items that should be sub-grouped (e.g. label + input pair) | Wrap the pair into `{col / group}` |

### Wrapping procedure

Implemented in `scripts/process.figma.js` — `opWrap()`. Express as:
```json
{ "op": "wrap", "parentId": "PARENT_ID", "childIds": ["A","B"], "direction": "VERTICAL", "name": "{col / pattern}" }
```

Key steps (for reference):
1. Capture `layoutSizingH/V` from first child before any move (inherit as wrapper sizing; default FILL/HUG)
2. `figma.createFrame()` → `applyALSettings()` → `appendChild` each child → `parent.insertChild(originalIndex, wrapper)`
3. Restore sizing on wrapper from first child
4. `applyFillCounterAxis(wrapper)` — sets FILL on counter axis for every child inside

> **Always move children before inserting** — `appendChild` detaches from parent automatically.
> **After wrapping, re-classify the parent** — its role may change (e.g. was `pattern`, becomes `group`).
> **Never assume HUG** — always inherit or restore sizing explicitly after any move.

---

## 3a. Ungrouping rules — remove redundant single-instance wrappers

**Run this pass BEFORE classification.** A frame that contains exactly one INSTANCE child and nothing else is a redundant wrapper — it adds no layout value and should be flattened.

### Detection criteria

| Condition | Action |
|---|---|
| FRAME with `layoutMode` set + exactly 1 child + that child is an INSTANCE | **Ungroup** — lift the INSTANCE to the parent at the same slot index, remove the wrapper frame |
| FRAME with `layoutMode` set + exactly 1 child + that child is another FRAME (pass-through wrapper) | **Ungroup** — lift the inner FRAME up, remove the outer shell |

> **Do NOT ungroup** if the wrapper has meaningful padding, fills (visible surface), constraints, or a semantic name (not a generic name like `Inputs`, `Frame NNN`, `Group NNN`).

### Ungrouping procedure

Implemented in `scripts/process.figma.js` — `opUngroup()`. Express as:
```json
{ "op": "ungroup", "id": "WRAPPER_FRAME_ID" }
```

Key steps (for reference):
1. Capture wrapper name/id AND `layoutSizingH/V` **before any mutation** — `.name` throws after `remove()`
2. `parent.insertChild(idx, inner)` → `wrapper.remove()`
3. Restore wrapper's sizing on the lifted child

> Use the `nodeCache` map built at startup in `process.figma.js` for O(1) node lookups — never `figma.currentPage.findOne()` in a loop.
> After ungrouping, re-run classification on the parent — its role may change.

---

## 4. Naming convention

```
{direction / role}
```

| Direction | `layoutMode` |
|---|---|
| `col` | VERTICAL |
| `row` | HORIZONTAL |

Full name examples:

| Name | Meaning |
|---|---|
| `{col / section}` | Vertical container wrapping multiple groups |
| `{col / group}` | Vertical block — label + content |
| `{col / pattern}` | Vertical stack of same-type items |
| `{row / pattern}` | Horizontal row of same-type items |
| `{row / group}` | Horizontal block — icon + label etc |
| `{row / section}` | Horizontal container wrapping multiple groups (rare) |

---

## 5. Auto-layout settings on conversion

Implemented in `scripts/process.figma.js` — `applyALSettings()` + `applyFillCounterAxis()`. Applied by all op handlers (`opWrap`, `opAL`). Settings for reference:

```
layoutMode              = direction      // 'VERTICAL' | 'HORIZONTAL'
itemSpacing             = 0              // placeholder — token applied by token op
primaryAxisSizingMode   = 'AUTO'
counterAxisSizingMode   = 'AUTO'
paddingTop/Bottom/Left/Right = 0
fills                   = []             // transparent
clipsContent            = false
// After children appended: FILL on counter axis for every direct child
```

> **Critical:** this also applies after ungrouping or wrapping — always restore sizing explicitly. Never assume a moved node retains its sizing.

---

## 6. Token mapping (for Tokenator 9000 handoff)

### 6a. Gap tokens — `itemSpacing`

Apply to auto-layout FRAMEs based on role. Description from registry:

| Layer name | Token | Value | Registry description |
|---|---|---|---|
| `{col / section}` | `fds-spacing-const-gap-v-section` | 32px | Macro-separation between massive, unrelated page blocks or sections |
| `{col / group}` | `fds-spacing-const-gap-v-group` | 20px | Meso-separation between distinct clusters of components (e.g. fieldset to fieldset) |
| `{col / pattern}` | `fds-spacing-const-gap-v-pattern` | 12px | Atomic rhythmic spacing between identical units like sibling Input fields |
| `{row / pattern}` | `fds-spacing-const-gap-h-pattern` | 12px | Horizontal rhythmic distance between sibling components to maintain a predictable grid |
| `{row / group}` | `fds-spacing-const-gap-h-pattern` | 12px | Same horizontal grid token — group direction doesn't change the gap scale |
| `{row / section}` | `fds-spacing-const-gap-h-pattern` | 12px | Rare; use same horizontal grid token |

**Token Studio paths:**

| Token | TS path | NV variable name |
|---|---|---|
| `gap-v-section` | `spacing.fds-spacing-const.gap.v.fds-spacing-const-gap-v-section` | `spacing/fds-spacing-const/gap/v/fds-spacing-const-gap-v-section` |
| `gap-v-group` | `spacing.fds-spacing-const.gap.v.fds-spacing-const-gap-v-group` | `spacing/fds-spacing-const/gap/v/fds-spacing-const-gap-v-group` |
| `gap-v-pattern` | `spacing.fds-spacing-const.gap.v.fds-spacing-const-gap-v-pattern` | `spacing/fds-spacing-const/gap/v/fds-spacing-const-gap-v-pattern` |
| `gap-h-pattern` | `spacing.fds-spacing-const.gap.h.fds-spacing-const-gap-h-pattern` | `spacing/fds-spacing-const/gap/h/fds-spacing-const-gap-h-pattern` |

---

### 6b. Utility token — `ui-gap` (8px) — primary fallback for `itemSpacing`

> **`fds-spacing-const-ui-gap` is the default fallback whenever a gap-* token does not fit.**  
> If a FRAME's children are not a clean section/group/pattern (e.g. icon+label, mixed inline controls, tightly coupled siblings), use `ui-gap` before considering any other option.

| Trigger | Token |
|---|---|
| Children are ICON (≤ 24×24 INSTANCE) + TEXT sibling | `fds-spacing-const-ui-gap` |
| Children are tightly coupled inline controls not matching a gap-* role | `fds-spacing-const-ui-gap` |
| Any `itemSpacing` scenario where gap-v/h-pattern feels too large | `fds-spacing-const-ui-gap` |

| Token | TS path | NV variable name | Value |
|---|---|---|---|
| `fds-spacing-const-ui-gap` | `spacing.fds-spacing-const.utility.fds-spacing-const-ui-gap` | `spacing/fds-spacing-const/utility/fds-spacing-const-ui-gap` | 8px |

**Also in utility:**

| Token | Use case | TS path |
|---|---|---|
| `fds-spacing-const-ui-inset-reg` | Single ICON with no text (icon-only button / avatar) — square padding | `spacing.fds-spacing-const.utility.fds-spacing-const-ui-inset-reg` |

---

### 5c. Container tokens — `padding*`

Apply to FRAMEs that are **visible surfaces** (non-transparent fills). Never apply to transparent layout wrappers.

| Context | Token | TS path |
|---|---|---|
| Outermost canvas wrapper — standard viewport | `fds-spacing-const-container-canvas-reg` | `spacing.fds-spacing-const.container.fds-spacing-const-container-canvas-reg` |
| Outermost canvas wrapper — wide / hero layout | `fds-spacing-const-container-canvas-lg` | `spacing.fds-spacing-const.container.fds-spacing-const-container-canvas-lg` |
| Card or content container with a surface fill | `fds-spacing-const-container-card` | `spacing.fds-spacing-const.container.fds-spacing-const-container-card` |

**Agent rule:** only write padding tokens when `node.fills.length > 0` and at least one fill is not fully transparent. Skip padding on empty/transparent wrapper FRAMEs.

---

### 5d. Density tokens — `itemSpacing` on list/table rows

Apply **only** to FRAMEs whose children are homogeneous repeating rows (list, table, menu contexts).

| Token | Value | Use |
|---|---|---|
| `fds-spacing-const-density-compact` | — | Power-user views; maximises data per viewport |
| `fds-spacing-const-density-reg` | — | Standard lists and menus; default choice |
| `fds-spacing-const-density-wide` | — | Editorial spacing; high-value individual items |

**Agent trigger signals:** parent name contains `table`, `list`, or `menu`; OR ≥ 6 identical INSTANCE children. Default to `density-reg` unless context specifies otherwise.

| Token | TS path |
|---|---|
| `fds-spacing-const-density-compact` | `spacing.fds-spacing-const.density.fds-spacing-const-density-compact` |
| `fds-spacing-const-density-reg` | `spacing.fds-spacing-const.density.fds-spacing-const-density-reg` |
| `fds-spacing-const-density-wide` | `spacing.fds-spacing-const.density.fds-spacing-const-density-wide` |

---

### 5e. Primitives — never agentic

`fds-spacing-050` through `fds-spacing-600` are raw scale values for arbitrary, one-off use by designers only. **Agents must never assign these.** If no semantic token fits, use `ui-gap` instead.

---

## 7. Token decision tree

```
Target: itemSpacing
│
├─ Children are homogeneous repeating rows (list / table / menu)?
│   └─ YES → density-reg (or compact/wide per context)
│
├─ Children match section / group / pattern role?
│   ├─ {col / section}  → gap-v-section  (32px)
│   ├─ {col / group}    → gap-v-group    (20px)
│   ├─ {col / pattern}  → gap-v-pattern  (12px)
│   └─ {row / *}        → gap-h-pattern  (12px)
│
└─ None of the above fit?
    └─ DEFAULT → ui-gap (8px)  ← use this before any primitive


Target: padding (all 4 sides)
│
├─ FRAME has visible fill (card / surface)?
│   └─ YES → container-card
│
├─ FRAME is outermost canvas wrapper?
│   ├─ Standard view  → container-canvas-reg
│   └─ Wide / hero    → container-canvas-lg
│
└─ FRAME is transparent wrapper?
    └─ Skip — no padding token
```

---

## 8. Edge cases

| Situation | Rule |
|---|---|
| GROUP auto-removed when children moved | Wrap `group.remove()` in `try/catch` — Figma silently destroys the group when it empties |
| Standalone sibling clearly belongs inside a group | Absorb (`group.appendChild(sibling)`) before converting the group |
| FRAME already has `layoutMode` but wrong direction | Change `layoutMode` in-place; do not rebuild |
| Mixed children (frames + leaves, but only 1 frame) | Classify as `group`, not `section` |
| Node references inside auto-layout frames | Always traverse from root with `.children.find(...)` — never call `getNodeByIdAsync` on inner nodes mid-script |
| itemSpacing doesn't match any gap-* role | Use `ui-gap` (8px) — never fall back to a primitive |
| FRAME has fills but is clearly a layout wrapper (fills = transparent overlay) | Treat as transparent — skip container padding token |
| 2+ sub-frames have the same name | Treat as repeating rows = `pattern`, not `section` |
| Contiguous same-family children broken by a different component | Wrap each run into `{col / pattern}`, promote parent to `{col / group}` — do not call parent a section |
| Loose INSTANCE sibling alongside named FRAME children | Wrap lone INSTANCE into a `{col / pattern}` at its original index before classifying parent |
| Token applied to variant root only | Also apply tokens to every direct child AL frame that has `itemSpacing` — the root and each child are independent token targets |
| FRAME with 1 INSTANCE child and no padding / fill | Ungroup — lift INSTANCE to parent, remove wrapper. Run this pass before classification |
| FRAME with 1 FRAME child and no padding / fill | Ungroup — lift inner FRAME to parent, remove outer shell. Run before classification |
