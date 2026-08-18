# Mapping Rules

<!-- schema-version: 1 -->

> **Bulk-update rules for token migrations.**
> Agent parses these YAML blocks during Phase 3 to generate the write payload.
>
> — See `examples/mapping-rules.example.md` for format reference and field descriptions.
> — Rules are applied in order. Use `scope` to limit which properties each rule touches.
> — After parsing, the agent previews all target nodes and waits for confirmation before writing.

---

## Global rule: theme-aware content fill tokens

**This rule applies to ALL component types** — buttons, inputs, headers, cards, or any component with Theme/Surface/Appearance variants.

When binding fill tokens to content nodes (TEXT, VECTOR icons), the token MUST match the variant's surface context:

| Variant property value                                                                                                 | Content fill token (`hi` emphasis)    | Content fill token (`m` emphasis)    |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------ |
| `Theme=Surface`, `Theme=Surface-Variant`, `Surface=on-surface`, `Appearance=onSurface`                                 | `var/fds/fds-on-surface-hi`           | `var/fds/fds-on-surface-m`           |
| `Theme=Alternate-Surface`, `Theme=Alternate-Surface-Variant`, `Surface=on-alternate-surface`, `Appearance=onAlternate` | `var/fds/fds-on-alternate-surface-hi` | `var/fds/fds-on-alternate-surface-m` |

**Detection:** Extract the theme from the variant name. If it contains `Alternate` → use `fds-on-alternate-surface-*`. Otherwise → use `fds-on-surface-*`.

**Never apply a single `on-surface-*` token to all variants regardless of theme.** This is the most common mistake — it results in dark text on dark backgrounds or light text on light backgrounds.

---

## YAML rule template

Use this schema when generating `RULES` for `bulk-update.figma.js`. Each YAML block maps directly to one entry in the `RULES` array.

```yaml
# ─── Template ────────────────────────────────────────────────────────────────
- id: "rule-id" # unique, kebab-case identifier
  layer_pattern: "pattern" # string to match against node.name
  matchType: "exact" # exact | contains | regex
  writes:
    # Token Studio write (sets plugin data + auto-NV resolution)
    - type: ts
      key: fill # TS property key (fill, borderRadius, paddingTop, etc.)
      value: "var.fds.fds-surface-variant" # full TS dot-path
      rawValue: "#1a1a2e" # optional CSS fallback if NV not found

    # Native variable write (manual override — use only when auto-NV fails)
    - type: nv
      prop: "fills" # Figma node property to bind
      varId: "VariableID:..." # exact Figma variable ID
```

**Example — button fill + radius + spacing:**

```yaml
- id: btn-fill-surface
  layer_pattern: "btn"
  matchType: contains
  writes:
    - type: ts
      key: fill
      value: "var.fds.fds-surface-variant"

- id: btn-radius-reg
  layer_pattern: "btn"
  matchType: contains
  writes:
    - type: ts
      key: borderRadius
      value: "fds-round-const.ui-controls.btn.fds-round-const-btn-reg"

- id: btn-spacing-reg
  layer_pattern: "btn"
  matchType: contains
  writes:
    - type: ts
      key: paddingTop
      value: "spacing.fds-spacing-const.btn.reg.fds-spacing-const-btn-reg-v"
    - type: ts
      key: paddingBottom
      value: "spacing.fds-spacing-const.btn.reg.fds-spacing-const-btn-reg-v"
    - type: ts
      key: paddingLeft
      value: "spacing.fds-spacing-const.btn.reg.fds-spacing-const-btn-reg-h"
    - type: ts
      key: paddingRight
      value: "spacing.fds-spacing-const.btn.reg.fds-spacing-const-btn-reg-h"
    - type: ts
      key: itemSpacing
      value: "spacing.fds-spacing-const.utility.fds-spacing-const-ui-gap"
```

---

## Button token rules

Apply these rules whenever the target component is a button (layer name contains `btn`, `button`, `Button`, or variant properties contain `Appearance` / `State` / `Device`).

### Fill colours

> **Rule: `fds-btn-on-*` and `fds-on-btn-*` are NEVER background fills.** `on-*` tokens are always for content rendered ON TOP of a surface (text, icons, borders). Button background fill uses `fds-surface-variant` / `fds-alternate-surface-variant` (or a custom team token).

| Use case                                                                 | Background fill token                                                                               | Content (`on-*`) token                     |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Surface-style button on surface** (`Appearance=onSurface`)             | `var.fds.fds-surface-variant`                                                                       | `fds-on-surface-*` for text/icon           |
| **Surface-style button on alternate surface** (`Appearance=onAlternate`) | `var.fds.fds-alternate-surface-variant`                                                             | `fds-on-alternate-surface-*` for text/icon |
| **Core FDS standard button**                                             | `fds-btn-*` (e.g. `fds-btn-default`)                                                                | `fds-on-btn-*` for text/icon on top        |
| **Custom team button**                                                   | Keep the team's fill token — do **not** overwrite. Ask the user to confirm which fill token to use. |                                            |

> **Per-state fill:** `fds-surface-variant` is a single variable — state changes (hover/active/default) are resolved via Figma variable modes, not by switching to a different fill token. Do **not** use `fds-btn-on-surface-default/active` etc. as fill — those are wrong.

> **Fill NV binding:** `setBoundVariable('fills', v)` is not supported on COMPONENTs. Always use `figma.variables.setBoundVariableForPaint(paints[0], 'color', v)` and reassign `node.fills`.

### Border radius

Use `fds-round-const-btn-*` — **never** `fds-border-radius-btn-*` for radius on buttons.

| Button size tier  | Token                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| Small / compact   | `fds-round-const-btn-sm` → `fds-round-const.ui-controls.btn.fds-round-const-btn-sm`   |
| Regular (default) | `fds-round-const-btn-reg` → `fds-round-const.ui-controls.btn.fds-round-const-btn-reg` |
| Large / hero      | `fds-round-const-btn-lg` → `fds-round-const.ui-controls.btn.fds-round-const-btn-lg`   |

### Spacing (padding + gap)

| Property                                   | Token family                     | Notes                                                           |
| ------------------------------------------ | -------------------------------- | --------------------------------------------------------------- |
| `paddingTop/Bottom`                        | `fds-spacing-const-btn-{size}-v` | Match size tier to the button's visual density                  |
| `paddingLeft/Right`                        | `fds-spacing-const-btn-{size}-h` | Same size tier as vertical                                      |
| `itemSpacing` inside button (icon + label) | `fds-spacing-const-ui-gap`       | Always `ui-gap` — this is a UI-level spacing, not a pattern gap |

### Button borders (stroke)

Border tokens for buttons depend on **Type** (Primary/Secondary/Tertiary) and **Theme**. All borders use `type: "border"` writes with decomposed width + color.

| Type          | Theme                  | Composite token                                | Width NV (TS path)                                        | Color NV (TS path)                                                                |
| ------------- | ---------------------- | ---------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Primary**   | On header / On surface | `fds-stroke-const-ui-reg-on-surface`           | `fds-stroke/fds-stroke-100` (`fds-stroke.fds-stroke-100`) | `var/fds/fds-on-surface-ulow` (`var.fds.fds-on-surface-ulow`)                     |
| **Primary**   | On alternate surface   | `fds-stroke-const-ui-reg-on-alternate-surface` | `fds-stroke/fds-stroke-100` (`fds-stroke.fds-stroke-100`) | `var/fds/fds-on-alternate-surface-ulow` (`var.fds.fds-on-alternate-surface-ulow`) |
| **Secondary** | On header              | `fds-stroke-const-ghost-on-surface-color`      | `fds-stroke/fds-stroke-100` (`fds-stroke.fds-stroke-100`) | `ref/text/white/opacity100` (`ref.text.white.opacity100`)                         |
| **Secondary** | On surface             | `fds-stroke-const-ghost-on-surface`            | `fds-stroke/fds-stroke-100` (`fds-stroke.fds-stroke-100`) | `ref/brand/primary/primary40` (`ref.brand.primary.primary40`)                     |
| **Secondary** | On alternate surface   | `fds-stroke-const-ghost-on-alternate-surface`  | `fds-stroke/fds-stroke-100` (`fds-stroke.fds-stroke-100`) | `ref/text/white/opacity100` (`ref.text.white.opacity100`)                         |
| **Tertiary**  | all                    | **none**                                       | —                                                         | —                                                                                 |

> **Tertiary note:** Tertiary buttons may have a phantom `strokeWeight` (e.g. 2px) with an empty `strokes` array. This is intentional — leave it as-is. Do not bind border tokens to Tertiary.

> **Primary border rationale:** Primary buttons have a solid background fill (shade). The UI border provides a subtle containment line that does not compete with the fill — `ulow` (ultra-low contrast) color ensures this.

> **Secondary border rationale:** Secondary (ghost) buttons use the border as their primary visual indicator — the fill is transparent or absent. Ghost border tokens use brand or white colors for prominence.

### When unsure about size tier (sm / reg / lg)

**Always ask before writing** using `vscode_askQuestions`:

```json
{
  "questions": [
    {
      "header": "btn-size-tier",
      "question": "Which button size tier should I use for spacing and radius tokens?",
      "allowFreeformInput": false,
      "options": [
        {
          "label": "sm — Small / compact / toolbar",
          "description": "fds-spacing-const-btn-sm-v/h + fds-round-const-btn-sm"
        },
        {
          "label": "reg — Regular / standard (default)",
          "description": "fds-spacing-const-btn-reg-v/h + fds-round-const-btn-reg",
          "recommended": true
        },
        {
          "label": "lg — Large / hero CTA",
          "description": "fds-spacing-const-btn-lg-v/h + fds-round-const-btn-lg"
        }
      ]
    }
  ]
}
```

### Content fills (text + icons) — REQUIRED step, never omit

After binding the background fill on the COMPONENT frame, you **must** also bind fill NV on every TEXT and `icon` VECTOR node inside each component variant.

**Rule:** For surface-style buttons, content fill is determined by `Appearance`/`Theme`. For core FDS buttons, it is determined by the **Colour variant axis**.

#### Surface-style buttons (Appearance-based)

| Appearance    | Content fill token                    | Variable name                         |
| ------------- | ------------------------------------- | ------------------------------------- |
| `onSurface`   | `var.fds.fds-on-surface-hi`           | `var/fds/fds-on-surface-hi`           |
| `onAlternate` | `var.fds.fds-on-alternate-surface-hi` | `var/fds/fds-on-alternate-surface-hi` |

#### Core FDS buttons (Colour-variant-based)

The **Colour** variant axis determines which `fds-on-btn-*` / `fds-btn-on-*` token to use. These tokens exist as **NV COLOR variables** (not just paint styles) — bind via `setBoundVariableForPaint(fills[0], 'color', var)`.

| Colour variant value        | Content fill NV name                           | TS path                                        | Resolves to   |
| --------------------------- | ---------------------------------------------- | ---------------------------------------------- | ------------- |
| `accent`                    | `var/btn/fds-on-btn-accent`                    | `var.btn.fds-on-btn-accent`                    | white @ 87%   |
| `default`                   | `var/btn/fds-on-btn-default`                   | `var.btn.fds-on-btn-default`                   | white @ 87%   |
| `alternate accent`          | `var/btn/fds-on-btn-alternate-accent`          | `var.btn.fds-on-btn-alternate-accent`          | white @ 100%  |
| `header default`            | `var/btn/fds-btn-on-header-default`            | `var.btn.fds-btn-on-header-default`            | white @ 100%  |
| `surface default`           | `var/btn/fds-btn-on-surface-default`           | `var.btn.fds-btn-on-surface-default`           | brand primary |
| `alternate surface default` | `var/btn/fds-btn-on-alternate-surface-default` | `var.btn.fds-btn-on-alternate-surface-default` | white @ 100%  |

> **Important:** These tokens apply to **all button types** (Primary, Secondary, Tertiary) — the Colour axis, not Type, determines content color.

**Emphasis level:** default to `hi` unless the design uses a different emphasis. Ask with `vscode_askQuestions` if unsure:

```json
{
  "questions": [
    {
      "header": "Text fill token",
      "question": "Which emphasis level for the label text?",
      "options": [
        {
          "label": "fds-on-surface-hi / fds-on-alternate-surface-hi",
          "recommended": true
        },
        { "label": "fds-on-surface-m / fds-on-alternate-surface-m" },
        { "label": "fds-on-surface-color / fds-on-alternate-surface-color" }
      ]
    },
    {
      "header": "Icon fill token",
      "question": "Which emphasis level for the icons?",
      "options": [
        { "label": "Same as text", "recommended": true },
        { "label": "fds-on-surface-m / fds-on-alternate-surface-m" }
      ]
    }
  ]
}
```

**How to collect content nodes:** recurse the full component subtree; collect nodes where `type === 'TEXT'` or `(type === 'VECTOR' && name === 'icon')`. Apply `setBoundVariableForPaint` + TS metadata on each.

**TS key:** `fill` (same key as background fill — set on the content node itself, not the parent frame).

### Custom team buttons

When a button component has custom fill properties (e.g. a product-specific accent colour not in the core `fds-btn-*` set):

1. Do **not** overwrite the fill with a generic FDS token
2. Apply spacing, radius, border, and gap tokens as normal
3. For the fill: write the team's own token path (confirm with user if ambiguous)
4. Note in the Phase 2 report: `⚠️ Custom fill — team token applied, FDS fill skipped`

---

## Card / container token rules

Apply when the target is a **card** or **container** component (layer name contains `Card`,
`Container`, `Panel`, `Tile`, or a `Padding` variant axis with a surrounding `Theme` axis).

### Padding insets — use the correct TS keys

> **Rule: card padding insets use `verticalPadding` + `horizontalPadding` keys — NOT `spacing`.**
> The `spacing` TS key maps to `itemSpacing` (the gap between children), not the container's
> inset padding. A card whose insets are written under `spacing` will set the wrong property.

| Property             | TS key                      | Token                                                                  | Notes                                    |
| -------------------- | --------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| Top/bottom inset     | `verticalPadding`           | `spacing.fds-spacing-const.container.fds-spacing-const-container-card` | Prefer the component-specific card token |
| Left/right inset     | `horizontalPadding`         | `spacing.fds-spacing-const.container.fds-spacing-const-container-card` | Same card token                          |
| Gap between children | `spacing` (→ `itemSpacing`) | `fds-spacing-*` per design                                             | Only the gap belongs under `spacing`     |

> **Prefer `fds-spacing-const-container-card` over the generic `fds-spacing-200`** for card
> internal padding. The generic scale step happens to resolve to the same value today, but the
> component-specific token survives scale retuning.

### Border colour — must match the variant's surface theme

> **Rule: the card border colour token MUST match the `Theme` axis** (same detection as the
> global content-fill rule). A frequent copy-paste error is `surface`-theme variants carrying
> `var.fds.fds-on-alternate-surface-ulow`.

| Theme                                    | borderColor token                       |
| ---------------------------------------- | --------------------------------------- |
| `Theme=surface`, `Theme=surface-variant` | `var.fds.fds-on-surface-ulow`           |
| `Theme=alternate-surface`                | `var.fds.fds-on-alternate-surface-ulow` |

**Audit check:** in Phase 2, flag any `surface`-theme variant whose `borderColor` resolves to an
`alternate-surface` token (or vice versa) as a semantic error before writing.

### NV binding intent

> A `var.fds.*` TS path prefix signals that a **native variable binding is intended** for that
> property — but the binding may never have been applied (`varMap` empty = "TS-draft" state).
> When a card audit returns TS tokens with zero NV bindings, treat Phase 3 NV binding as required,
> not optional.

---

## Elevation (box shadow) rules

Elevation is applied via **Figma Effect Styles** (`effectStyleId`), not variables. TS metadata key is `boxShadow`.

### Tier selection

| Component size / context                                  | Token                                | Effect style name                               |
| --------------------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| **Heavy** — large cards, hero panels                      | `fds-elevation-const-surface-heavy`  | `on-surface/fds-elevation-const-surface-heavy`  |
| **Medium** — popovers, dropdowns, sort overlays, tooltips | `fds-elevation-const-surface-medium` | `on-surface/fds-elevation-const-surface-medium` |
| **Light** — badges, buttons, chips, tiny elements         | `fds-elevation-const-surface-light`  | `on-surface/fds-elevation-const-surface-light`  |

Choose `on-alternate-surface/*` variants when component sits on an alternate surface.

### How to apply

```js
var allEffectStyles = figma.getLocalEffectStyles();
var style = allEffectStyles.find(function (s) {
  return s.name === "on-surface/fds-elevation-const-surface-medium";
});
node.effectStyleId = style.id;
node.setSharedPluginData(
  "tokens",
  "boxShadow",
  '"on-surface.fds-elevation-const-surface-medium"',
);
```

> **TS path encoding:** replace `/` with `.` when writing the effect style name as a TS token path.

---

## Header / section strip rules

Apply when the target component is a **header row** or **section strip** (layer name contains `Header`, `Section Header`, `Navigation Strip`, or component variants use `Surface=on-surface` / `Surface=on-alternate-surface` without a list or overlay context).

### Identifying characteristics

- Horizontal layout row, typically 32–48px tall
- No background fill on the COMPONENT itself (fills = 0) → **no background fill binding needed**
- Zero corner radius → **no radius binding needed**
- Children are title/label INSTANCEs + action/navigation button INSTANCEs

### Spacing tokens

| Property            | Typical design value                           | Token strategy                                                      |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| `paddingTop/Bottom` | 4px                                            | Use `fds-spacing-050` primitive — no semantic header-v token exists |
| `paddingLeft/Right` | 16px                                           | Use `fds-spacing-200` primitive — no semantic header-h token exists |
| `itemSpacing`       | 8px (gap between title group and action group) | `fds-spacing-const-ui-gap` → `fds-spacing-100` = 8px                |

> **When no semantic header token exists for a given design value, use the matching spacing primitive** (`fds-spacing-050` / `fds-spacing-100` / `fds-spacing-150` / `fds-spacing-200`). Do not force a `btn-*` or `density-*` token onto a header component.

> **Confirmed variable IDs for this file:**
>
> - `fds-spacing-050`: `VariableID:8094:59602` (4px)
> - `fds-spacing-200`: `VariableID:8094:59605` (16px)
> - `fds-spacing-const-ui-gap`: `VariableID:8094:59638` (→ `fds-spacing-100`, 8px)

### Content fills — same rule as buttons

Recurse full subtree; bind `fds-on-surface-hi` / `fds-on-alternate-surface-hi` on all TEXT and `icon` VECTOR nodes, matched to the `Surface=on-surface` / `Surface=on-alternate-surface` variant.

---

## List item density rules

List items inside containers (popovers, menus, dropdowns, drawers) use **density tokens** for `paddingTop/Bottom` only. Horizontal padding uses the spacing primitive.

> **Density applies only to `paddingTop` and `paddingBottom`** — never to left/right padding.

### Density token tier selection

| Token                               | Resolves to                  | Description                              | Use when                                              |
| ----------------------------------- | ---------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `fds-spacing-const-density-compact` | `fds-spacing-050` = **4px**  | Maximizes data density; power-user views | Very dense data tables, compact lists                 |
| `fds-spacing-const-density-reg`     | `fds-spacing-100` = **8px**  | Balanced; standard lists & menus         | **Default** — sort menus, dropdowns, navigation lists |
| `fds-spacing-const-density-wide`    | `fds-spacing-200` = **16px** | Editorial; high-value items              | Feature lists, onboarding, premium cards              |

TS path: `spacing.fds-spacing-const.density.fds-spacing-const-density-{compact|reg|wide}`

### Horizontal padding

List item left/right padding = `fds-spacing-100` (8px primitive — no semantic density equivalent for horizontal).

TS path: `spacing.fds-spacing.fds-spacing-100`

### Hardcoded value rule

If the design value (e.g. 12px) does not match any density token, **do not silently hardcode** — use the nearest spacing primitive (`fds-spacing-150` = 12px) and ask the user to confirm before writing.

### How to detect inconsistency

Before applying, check that all sibling rows in the same component have matching `paddingTop`. If any row has `paddingTop: 0` while siblings have non-zero values, flag it as a design inconsistency and fix it to match the chosen density tier.

---

## Border radius — container/overlay rules

| Use case                                                           | Token                                                    | TS path                                                             |
| ------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------- |
| **Standard containers** — lists, panels, cards, popovers, overlays | `fds-round-const-container-reg`                          | `fds-round-const.containers.standard.fds-round-const-container-reg` |
| **Large containers** — wide/tall card variants                     | `fds-round-const-container-lg`                           | `fds-round-const.containers.standard.fds-round-const-container-lg`  |
| **Modal-class** — full-screen drawers, modal dialogs               | `fds-round-const-modal-reg` / `fds-round-const-modal-lg` | `fds-round-const.containers.modal-class.*`                          |
| **Buttons**                                                        | see Button token rules section — `fds-round-const-btn-*` |                                                                     |

> **Note:** `fds-round-const-container-reg` resolves to **16px** and `fds-round-const-modal-reg` also resolves to **16px** — they have distinct semantic meaning despite the same value. Use `container-reg` for overlay/popover panels; reserve `modal-reg` for true modal dialogs.

---

## Input field rules

Apply when the target component is an **input field** (layer name contains `Input`, `Field`, `FDS-Input`, or variant property `Type=text-input` / `State=default|focus|error`).

### Border radius

| Token                       | TS path                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `fds-round-const-input-reg` | `fds-round-const.ui-controls.input.fds-round-const-input-reg` |

Confirmed Variable ID: `VariableID:8094:59655` (resolves to 8px)

### Spacing

| Property                        | Token                       | TS path                                                      |
| ------------------------------- | --------------------------- | ------------------------------------------------------------ |
| `paddingTop` / `paddingBottom`  | `fds-spacing-const-input-v` | `spacing.fds-spacing-const.input.fds-spacing-const-input-v`  |
| `paddingLeft` / `paddingRight`  | `fds-spacing-const-input-h` | `spacing.fds-spacing-const.input.fds-spacing-const-input-h`  |
| `itemSpacing` (icon + text gap) | `fds-spacing-const-ui-gap`  | `spacing.fds-spacing-const.utility.fds-spacing-const-ui-gap` |

### Layout sizing

- Height: **FIXED** — input fields have a defined height, do not hug
- Width: **FILL** (counter axis) on most usage contexts

### Content fills — theme-aware (Label, Prefix, Suffix, Input Text, icons)

After binding spacing/radius on the Input FRAME, you **must** also bind fill NV on every TEXT and `icon` VECTOR node inside each variant. The token depends on the variant's **Theme** property:

| Theme variant                     | Content fill token                    | Variable ID             | Resolves to                 |
| --------------------------------- | ------------------------------------- | ----------------------- | --------------------------- |
| `Theme=Surface`                   | `var/fds/fds-on-surface-hi`           | `VariableID:8094:59349` | `ref/text/black/opacity87`  |
| `Theme=Surface-Variant`           | `var/fds/fds-on-surface-hi`           | `VariableID:8094:59349` | `ref/text/black/opacity87`  |
| `Theme=Alternate-Surface`         | `var/fds/fds-on-alternate-surface-hi` | `VariableID:8094:59357` | `ref/text/white/opacity100` |
| `Theme=Alternate-Surface-Variant` | `var/fds/fds-on-alternate-surface-hi` | `VariableID:8094:59357` | `ref/text/white/opacity100` |

> **Rule:** `Surface` and `Surface-Variant` → `fds-on-surface-hi`. `Alternate-*` → `fds-on-alternate-surface-hi`. Extract Theme from the variant name: `Theme=([^,]+)`. If starts with `Alternate` → alternate token.

> **Emphasis level:** default to `hi`. If the design uses different emphasis (e.g. Label at `m` for placeholder state), ask the user.

**How to apply:** Use `setBoundVariableForPaint(fills[0], 'color', variable)` on each TEXT/VECTOR node. Set `opacity = 1` (let the variable handle opacity through its resolved value). TS key = `fill`.

**Scope:** Apply to these named layers inside each variant: `Label`, `Input Text`, `Prefix`, `Suffix`, and any VECTOR child of `leading-icon` / `trailing-icon` instances.

**Background fill for label container:** If a FRAME named `label` or `Frame 1` wraps the Label text, bind its fill to the **same surface token as the parent Input frame** (theme-matched: `fds-surface-variant` / `fds-surface` / `fds-alternate-surface-variant` / `fds-alternate-surface`). Copy the fill variable from the sibling Input frame's `boundVariables.fills[0]`.

---

## Gradient fill rules

In this design system, **all TS tokens whose last segment ends with `-shade` or `-g` are gradients** (`GRADIENT_LINEAR`). Figma variables only support solid colors — gradients are stored as **paint styles**.

### Detection rule

```
TS path last segment ends with "-shade" or "-g"  →  paint style (not NV variable)
```

Examples:

- `var.btn.fds-btn-accent-shade` → paint style `btn/fds-btn-accent-shade`
- `var.btn.fds-btn-default-shade` → paint style `btn/fds-btn-default-shade`
- `var.btn.fds-btn-alternate-accent-shade` → paint style `btn/fds-btn-alternate-accent-shade`
- `var.fds.fds-success-shade` → paint style `fds/fds-success-shade`

### Binding mechanism

| Property                 | Solid color                           | Gradient                                            |
| ------------------------ | ------------------------------------- | --------------------------------------------------- |
| **Storage**              | Figma variable                        | Figma paint style                                   |
| **API**                  | `setBoundVariable('fills', 0, v)`     | `node.fillStyleId = style.id`                       |
| **Lookup**               | `getLocalVariablesAsync()` by name    | `getLocalPaintStylesAsync()` by name                |
| **bulk-update.figma.js** | Auto-NV resolution (skipped for fill) | Auto paint style resolution via `isGradientToken()` |
| **audit.figma.js**       | `boundVariables.fills`                | `node.fillStyleId`                                  |

### TS path → paint style name conversion

1. Split TS path on `.` → segments
2. Strip leading `var` segment (namespace prefix)
3. Join remaining segments with `/`

`var.btn.fds-btn-accent-shade` → strip `var` → `btn.fds-btn-accent-shade` → `btn/fds-btn-accent-shade`

> **Note:** The `bulk-update.figma.js` script handles this automatically. When a fill write's TS path matches the gradient suffix pattern, it resolves via paint styles instead of variables.

---

## Stroke width rules

Stroke width tokens control `strokeWeight` in Figma. Like border radius, Figma stores stroke weight as **4 individual properties**: `strokeTopWeight`, `strokeBottomWeight`, `strokeLeftWeight`, `strokeRightWeight`.

### Available tokens

| Token                       | Variable ID             | Resolves to |
| --------------------------- | ----------------------- | ----------- |
| `fds-stroke/fds-stroke-050` | `VariableID:8094:59675` | 0.5px       |
| `fds-stroke/fds-stroke-100` | `VariableID:8094:59676` | 1px         |
| `fds-stroke/fds-stroke-150` | `VariableID:8094:59677` | 1.5px       |
| `fds-stroke/fds-stroke-200` | `VariableID:8094:59678` | 2px         |

TS path format: `fds-stroke.fds-stroke-{tier}` (e.g. `fds-stroke.fds-stroke-150`)

### TS key mapping

| TS key              | Figma property bound                                                                | Scope                 |
| ------------------- | ----------------------------------------------------------------------------------- | --------------------- |
| `borderWidth`       | `strokeTopWeight` + `strokeBottomWeight` + `strokeLeftWeight` + `strokeRightWeight` | All 4 sides (uniform) |
| `borderWidthTop`    | `strokeTopWeight`                                                                   | Top only              |
| `borderWidthBottom` | `strokeBottomWeight`                                                                | Bottom only           |
| `borderWidthLeft`   | `strokeLeftWeight`                                                                  | Left only             |
| `borderWidthRight`  | `strokeRightWeight`                                                                 | Right only            |

> **Note:** `setBoundVariable('strokeWeight', v)` silently maps to all 4 individual weight properties. `boundVariables.strokeWeight` does NOT appear in read-back — check the 4 individual props instead.

### Typical usage by component

| Component                | Stroke token             | Notes                              |
| ------------------------ | ------------------------ | ---------------------------------- |
| Input field (all states) | `fds-stroke-150`         | Uniform 1.5px, INSIDE stroke align |
| Buttons                  | Usually none             | Buttons typically have no stroke   |
| Cards / containers       | `fds-stroke-100` or none | Thin border or borderless          |
| Dividers / separators    | `fds-stroke-050`         | Hairline                           |

---

## Media / Thumb rules

Apply when the target layer name contains `Thumb`, `thumbnail`, `media`, `_image`, or the component is a carousel/media tile.

### Border radius

| Use case          | Token                             | TS path                                                 |
| ----------------- | --------------------------------- | ------------------------------------------------------- |
| Regular thumbnail | `fds-round-const-media-thumb-reg` | `fds-round-const.media.fds-round-const-media-thumb-reg` |

Confirmed Variable ID: `VariableID:8094:59666` (resolves to 16px)

> **Remote component rule:** If the node is `remote: true` (published from another library), variable writes are blocked. In this case, add a native Figma annotation only — do **not** attempt `setBoundVariable`. Log the node as `remote-skip` in the audit report.

### Layers to skip

Always skip `_Image-holder`, `_Overlay`, and any layer name starting with `_` that is an `INSTANCE` — these are presentational containers, not tokenisable layout frames.

---

## Sportsbook card rules (container-group class)

Apply when the target is a **sportsbook betting card** — layer name contains `SB-Card`, `SB-card`, `betting-card`, or variant properties include `Usage=Sports` / `Usage=Home page`.

### Token bindings

| Property                       | Token                                          | Variable ID                                   | Resolved value |
| ------------------------------ | ---------------------------------------------- | --------------------------------------------- | -------------- |
| `cornerRadius`                 | `fds-round-const-container-lg`                 | `VariableID:8094:59660`                       | 20px           |
| `paddingLeft/Right/Top/Bottom` | `fds-spacing-const-container-group`            | `VariableID:8094:59628`                       | 8px            |
| `itemSpacing`                  | `fds-spacing-const-ui-gap`                     | `VariableID:8094:59638`                       | 8px            |
| `effectStyleId`                | `on-surface/fds-elevation-const-surface-heavy` | `S:e159aab36df57d0689998f8c12591e55836e7fb7,` | —              |

### Layout sizing

- **Height**: `primaryAxisSizingMode = AUTO` (hug) — cards expand to content
- **Width**: `counterAxisSizingMode = FIXED` — cards have a defined width

### Gap exceptions

Variants with `itemSpacing = 0` (e.g. Sports/Default, Sports/3-column-view) — **skip gap tokenisation**. Binding `ui-gap` on a zero-gap layout changes the visual. Log as `gap-skipped (itemSpacing=0)` in the audit.

### Write scope

Apply tokens to **top-level COMPONENT nodes only**. Do not recurse into INSTANCE children or nested FRAMEs. The card shell owns layout; sub-components own their own tokens.

---

## Layout sizing rules

These rules govern when to set `primaryAxisSizingMode` / `counterAxisSizingMode` during a token apply run.

> **Only change sizing mode if the current value is `FIXED` and the archetype rule requires `AUTO` (hug).** Never change a node that is already `AUTO` or `FILL`.

| Archetype                        | Primary axis (height for VERTICAL) | Counter axis (width for VERTICAL)     |
| -------------------------------- | ---------------------------------- | ------------------------------------- |
| **Sportsbook card**              | `AUTO` (hug)                       | `FIXED`                               |
| **Sort overlay / popover panel** | `AUTO` (hug)                       | `FIXED`                               |
| **Input field**                  | `FIXED`                            | `FILL` or `FIXED` (confirm with user) |
| **List item row**                | `AUTO` (hug)                       | `FILL`                                |
| **Header / section strip**       | `FIXED`                            | `FILL`                                |
| **Media thumb tile**             | `FIXED`                            | `FIXED`                               |

### How to apply

```js
// Hug height (VERTICAL layout)
node.primaryAxisSizingMode = "AUTO";

// Fixed height
node.primaryAxisSizingMode = "FIXED";

// Fill width
node.counterAxisSizingMode = "FILL_CONTAINER";
```

> **Ask before changing sizing** if the archetype is ambiguous or if the node is a COMPONENT_SET child that differs across variants.

---

## Annotations

When `Annotations: True` is passed to ODIN-9000 or MIMR, write Figma **native annotations** on each node that receives token bindings. Do **not** use `setSharedPluginData` for this purpose.

### API

```js
node.annotations = [
  {
    label: "Token bindings applied",
    properties: [
      { type: "cornerRadius" }, // border radius bound
      { type: "padding" }, // padding bound
      { type: "fills" }, // fill color bound  ← use 'fills', NOT 'fill'
      { type: "effects" }, // elevation/effect style bound
      { type: "itemSpacing" }, // gap bound
    ],
  },
];
```

### Valid `type` values (confirmed by API)

| Type string    | Use for                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| `cornerRadius` | `setBoundVariable('cornerRadius', ...)`                                      |
| `padding`      | `setBoundVariable('paddingLeft/Right/Top/Bottom', ...)`                      |
| `fills`        | `setBoundVariableForPaint(fill, 'color', ...)` — **use `fills`, NOT `fill`** |
| `effects`      | `effectStyleId` binding                                                      |
| `itemSpacing`  | `setBoundVariable('itemSpacing', ...)`                                       |
| `width`        | width sizing                                                                 |
| `height`       | height sizing                                                                |
| `layoutMode`   | layout direction                                                             |

> **Common mistake:** `type: 'fill'` throws a validation error. Always use `type: 'fills'` (plural).

### Format

Only include `properties` entries that were actually bound on the node. Omit unbound properties.

### Failure handling

If `node.setAnnotations` throws or is unavailable in the current API context:

1. Log `{ nodeId, error }` to the audit report under a `⚠️ annotation-skipped` row.
2. **Do not fall back to `setSharedPluginData`.** Shared plugin data is only for Token Studio (`tokens` namespace) and verified workflow metadata — never for display annotations.

---

## Composite border token decomposition

Composite border tokens (`type: "border"` in ts-core-fabric.json) combine `width` + `style` + `color` into a single TS path. Figma has no composite "border" property — these must be decomposed into **atomic width** (float variable → `strokeWeight`) + **atomic color** (color variable → `strokes[0]` paint).

### Detection rule

```
Token type = "border" in ts-core-fabric.json
OR TS path contains "fds-stroke-const" (composite namespace)
```

> **When to use:** Use `scripts/token-lookup.py --decompose` to resolve any composite border token into its atomic width + color references. Never guess the decomposition.

### Decomposition table

| Composite TS token                             | Width ref → NV name                                       | Color ref → NV name                                                               | Description                                  |
| ---------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| `fds-stroke-const-ui-s-on-surface`             | `fds-stroke.fds-stroke-050` → `fds-stroke/fds-stroke-050` | `var.fds.fds-on-surface-ulow` → `var/fds/fds-on-surface-ulow`                     | Subtle hairline border on primary surfaces   |
| `fds-stroke-const-ui-reg-on-surface`           | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `var.fds.fds-on-surface-ulow` → `var/fds/fds-on-surface-ulow`                     | Standard baseline border on primary surfaces |
| `fds-stroke-const-ui-s-on-alternate-surface`   | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `var.fds.fds-on-alternate-surface-ulow` → `var/fds/fds-on-alternate-surface-ulow` | Subtle border on alternate surfaces          |
| `fds-stroke-const-ui-reg-on-alternate-surface` | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `var.fds.fds-on-alternate-surface-ulow` → `var/fds/fds-on-alternate-surface-ulow` | Standard border on alternate surfaces        |
| `fds-stroke-const-int-rest`                    | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `var.fds.fds-on-surface-low` → `var/fds/fds-on-surface-low`                       | Input/interactive rest state                 |
| `fds-stroke-const-int-active`                  | `fds-stroke.fds-stroke-150` → `fds-stroke/fds-stroke-150` | `ref.brand.primary.primary40` → `ref/brand/primary/primary40`                     | Focus/active state (brand primary)           |
| `fds-stroke-const-int-error`                   | `fds-stroke.fds-stroke-150` → `fds-stroke/fds-stroke-150` | `ref.system.error.error40` → `ref/system/error/error40`                           | Error validation state                       |
| `fds-stroke-const-int-success`                 | `fds-stroke.fds-stroke-150` → `fds-stroke/fds-stroke-150` | `ref.system.success.success50` → `ref/system/success/success50`                   | Success validation state                     |
| `fds-stroke-const-int-disabled`                | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `var.fds.fds-on-surface-ulow` → `var/fds/fds-on-surface-ulow`                     | Disabled/inert state                         |
| `fds-stroke-const-ghost-on-surface`            | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `ref.brand.primary.primary40` → `ref/brand/primary/primary40`                     | Ghost button on standard surfaces            |
| `fds-stroke-const-ghost-on-alternate-surface`  | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `ref.text.white.opacity100` → `ref/text/white/opacity100`                         | Ghost button on dark surfaces                |
| `fds-stroke-const-ghost-on-surface-color`      | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `ref.text.white.opacity100` → `ref/text/white/opacity100`                         | Ghost button on colored surfaces             |
| `fds-stroke-const-divider-reg`                 | `fds-stroke.fds-stroke-050` → `fds-stroke/fds-stroke-050` | `var.fds.fds-on-surface-ulow` → `var/fds/fds-on-surface-ulow`                     | Hairline list separator                      |
| `fds-stroke-const-divider-heavy`               | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `var.fds.fds-on-surface-low` → `var/fds/fds-on-surface-low`                       | Heavy section separator                      |
| `fds-stroke-const-ui-transparent`              | `fds-stroke.fds-stroke-100` → `fds-stroke/fds-stroke-100` | `transparent`                                                                     | Layout-preserving invisible border           |
| `fds-stroke-const-ui-focus-ring`               | `fds-stroke.fds-stroke-150` → `fds-stroke/fds-stroke-150` | `ref.brand.primary.primary40` → `ref/brand/primary/primary40`                     | Accessibility focus ring                     |

### YAML rule template for composite borders

Use `type: "border"` writes to apply decomposed width + color in a single rule:

```yaml
- id: input-border-rest
  layer_pattern: "Input"
  matchType: contains
  writes:
    - type: border
      widthToken: "fds-stroke.fds-stroke-100" # atomic width TS path
      colorToken: "var.fds.fds-on-surface-low" # atomic color TS path
```

The `bulk-update.figma.js` script handles `type: "border"` by:

1. Resolving `widthToken` → NV name → `setBoundVariable` on all 4 stroke weight props
2. Resolving `colorToken` → NV name → `setBoundVariableForPaint(strokes[0], 'color', v)` on stroke paint
3. Writing TS metadata: `borderWidth` ← widthToken, `border` ← composite token path (optional)

### Transparent color exception

`fds-stroke-const-ui-transparent` has `color: "transparent"` — no color NV exists. The script:

1. Binds the width token normally
2. Sets `node.strokes = [{ type: 'SOLID', color: {r:0,g:0,b:0}, opacity: 0 }]` for the transparent color
3. Logs `color-transparent` in the report

---

## NV discovery pass on first write to a new file

On the **first** native-variable (NV) write to any new `fileKey`, run a
`getLocalVariablesAsync()` discovery pass to capture the EXACT variable names before binding.
Do **not** assume the dot→slash shorthand equals the Figma variable name — some files prefix all
NV names with a namespace (e.g. file `Ahvbwk0dUHeHazrQX2XtGd` prefixes everything with `var/`,
so audit shorthand `fds/fds-surface-variant` must be looked up as `var/fds/fds-surface-variant`).
Cache the resulting `name → VariableID` map per `fileKey + version` and reuse it for the write
pass.

---

## Component-specific audit notes

### FDS-Input (nested token architecture)

FDS-Input nests structural tokens on a child FRAME named `Input` at depth ≥ 1. The COMPONENT
root carries only `itemSpacing`. Root-only token reads give false `MISSING_*` results for fills,
border, padding, and radius. Always probe inner frames by name (`Input`) for the full binding picture.

### FDS-Input label TS/NV emphasis drift

The floating Label TEXT on FDS-Input has systematic TS/NV emphasis drift: TS fill = `fds-on-surface-m`
(or `fds-on-alternate-surface-m`) while NV is bound to `fds-on-surface-hi` (or `fds-on-alternate-surface-hi`)
on ALL non-focus variants. Only the Focus variant aligns both at `-hi`. The Success/Alt-Surf-Var
label incorrectly uses `fds-success` as its TS fill (wrong category — should be text-emphasis).
**Flag as `TS_NV_CONFLICT`, do not auto-rebind.** Never use semantic state tokens (`fds-success`,
`fds-error`) as label TEXT fill — use text-emphasis tokens.

---

## Library-linked NV collections (team library, not local to file)

When the NV variable collection is imported from a **team library** (e.g. `[Lib]: FDS Design Tokens`) rather than defined locally in the file:

1. `getLocalVariablesAsync()` returns **empty** for library-only variables — do not rely on it to resolve names.
2. Discover the collection: `figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()` → match by `libraryName`.
3. Resolve name → key: `figma.teamLibrary.getVariablesInLibraryCollectionAsync(collectionKey)`.
4. Import before binding: `figma.variables.importVariableByKeyAsync(variableKey)` — cache the imported `Variable` per short name for the run.
5. For `fills`/`strokes`, never call `node.setBoundVariable('fills', 0, v)` directly — it throws `must be set on paints directly`. Clone the paint, call `figma.variables.setBoundVariableForPaint(paint, 'color', variable)`, then reassign `node.fills = [newPaint]`.
6. **Gradient paints** (`GRADIENT_LINEAR`, etc.) cannot take a solid-color variable bind — `setBoundVariableForPaint` throws `can only bind variables to solid paints`. Treat these as legitimate audit exceptions (e.g. progress-step gradients, shade overlays) and skip rather than forcing a fallback solid paint.

### PAT scope gap (per-file note)

For file `mavdkFAsPZZiatzwZ39wsn` ("Fig Vars FDS Demo"), the project PAT lacks `file_variables:read` scope, so `GET /v1/files/{key}/variables/local` returns 403. NV name discovery for this file must go through the Plugin API (`getLocalVariablesAsync` / `teamLibrary.*Async`), not REST. Derive candidate names from the TS dot→slash convention and confirm via the Plugin API on first write.

### fds-collapsible inner-node NV gap

fds-collapsible COMPONENT roots have TS+NV complete fill/borderColor, but inner layers (chevron VECTORs, title TEXTs, content-slot INSTANCEs) are TS-only and need an NV write pass: chevron → `fds-on-surface-m` / `fds-on-alternate-surface-low`; title TEXT → `fds-on-surface-hi` / `fds-on-alternate-surface-hi` + `Paragraphs.fds` typography; content slots → `fds-surface-variant` / `fds-alternate-surface-variant`. Also fix node `8889:78084` (on-alternate-surface, Stroke=Hidden, Accordion-State=Open) which carries `fds-surface-variant` fill TS instead of `fds-alternate-surface-variant` (copy-paste artifact) before running the NV pass.

---

<!-- Add YAML bulk-update rules below. Each rule is a fenced YAML block. -->
