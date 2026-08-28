# Component Gotchas

<!-- schema-version: 1 -->

> Component-selection and `$fig`-scripting pitfalls discovered while drafting screens with HUGIN.
> This file is about **which component/variant to pick and how to script it** — for token binding
> rules see `../mimr/data/mapping-rules.md`, for Auto Layout/naming conventions see
> `../vali/data/layout-rules.md`.

---

## Overlaying a node on a sibling inside Auto Layout — set `layoutPositioning: 'ABSOLUTE'`

Manually setting `node.x`/`node.y` on a child of an Auto Layout frame **does nothing by default**
— Auto Layout still places it in normal flow (as the next stacked item), silently ignoring your
coordinates. This is why an icon meant to be centered _on top of_ an image placeholder instead
showed up as its own row, pushed everything below it down, and looked "off position."

**Fix:** before setting `x`/`y` to overlay a node on a sibling, set
`node.layoutPositioning = 'ABSOLUTE'` first — only then does Auto Layout leave it alone and let
manual `x`/`y` (relative to the Auto Layout parent's content box) take effect.

## A fill bound via `$fig` creation-time `color: $fig.getVar(key)` can silently fail to render

Setting a background fill through `$fig.rectangle`/`$fig.autoLayout`'s `fills:
[{ type:'SOLID', color: $fig.getVar(key) }]` creation option **looked correctly bound** when
inspected (`boundVariables.color` pointed at the right variable, `node.fills[0].color` showed a
literal fallback) but rendered as that literal fallback (e.g. solid white) instead of the token's
real resolved color — invisible against a similarly light background. This happened even though
the identical pattern works fine for other fills elsewhere; the exact trigger isn't fully pinned
down (multi-mode variable, node type, or both), so treat any _new_ background-fill token as
unverified until you've actually looked at a screenshot, not just the `boundVariables` JSON.

**Fix:** if a screenshot shows a bound fill not visually applying, rebind it in a raw Pass-C
mutation using a properly-imported real `Variable` (not a `$fig.getVar()` handle):

```js
const realVar = await figma.variables.importVariableByKeyAsync(key);
const paint = { type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }; // any literal — overwritten by the bind
node.fills = [
  figma.variables.setBoundVariableForPaint(paint, "color", realVar),
];
```

This has proven reliable every time it's been tried as a fix — treat it as the default recovery
step whenever a `$fig`-creation-time fill binding doesn't visually render, rather than debugging
further in the moment.

## SVG icons — outline-only elements need explicit `fill="none"`

An SVG `<rect>`/`<path>` with no `fill` attribute defaults to **solid black fill** per the SVG
spec, not "no fill." An icon meant to be outline-only (stroke only) silently rendered as an
opaque black shape because the source SVG string only set `stroke`, not `fill="none"`.

**Fix:** every SVG element that should be stroke-only must have `fill="none"` explicit in the
source string passed to `$fig.svg(...)`. Only elements that are genuinely meant to be a solid
shape (e.g. a filled dot) should carry a real `fill` value.

---

## `$fig` scripting — `$fig.getVar()` handles only work inside `$fig` calls

`$fig.getVar(key)` returns a `$fig`-internal handle, not a plain resolved color. It works when
passed straight into a `$fig` creation call (e.g. `$fig.text({ fills: [{ type: 'SOLID', color:
$fig.getVar(key) }] })`), but assigning it to `node.fills` on an already-materialized node in a
raw Pass-C mutation throws `Required value missing at [0].color.r ... Unrecognized key(s):
_type, id, resolvedType, variable`.

**Fix:** bind variable-backed fills at `$fig` creation time (Pass B), not in raw mutation. If a
fill genuinely must be set on an existing raw node, import the real `Variable` first
(`await figma.variables.importVariableByKeyAsync(key)`) and use
`figma.variables.setBoundVariableForPaint(paint, 'color', variable)` before reassigning
`node.fills` — never hand the `$fig.getVar()` handle to raw `node.fills` directly.

## ⚠️ Data-loss incident — an errored script can wipe more than its own changes

Once, an uncaught error partway through a script's raw-mutation pass (Pass C) was followed by a
subsequent read showing the **entire parent canvas** (6 previously-built, previously-screenshotted
screens) had zero children — not just that script's own edits rolled back. The exact mechanism
isn't confirmed, but the practical implication is clear.

**Rule:** never assume prior Figma state is safe just because it was screenshotted earlier in the
session. After **any** `use_figma` script error, re-verify the surrounding canvas with a fresh
`get_metadata` or `.screenshot()` before continuing — don't assume only the failing script's own
changes were affected. If content is missing, **stop and tell the user immediately** (data loss,
not a routine bug) and point them at Figma's own version history for recovery rather than
silently reconstructing from memory/conversation notes.

---

## Flair effects render invisible unless the frame's brand mode is set

The **Core Brands** variable collection defaults to `24:0` **Betsson Legacy**, in which every
Flair specular/gloss token resolves to **fully transparent**. Build a Flair-styled frame without
setting a mode and it renders flat — looking exactly like the effect styles silently failed. They
didn't; the mode is wrong.

**Fix:** set the mode explicitly on the top-level frame:

```js
const collection = await figma.variables.getVariableCollectionByIdAsync(
  someVar.variableCollectionId,
);
frame.setExplicitVariableModeForCollection(collection, "24:1"); // Betsson Light
```

`24:0` Legacy · `24:1` Betsson Light · `24:2` Betsson Dark · `24:3`–`24:7` white labels. See
`flair-style-guide.md`. Setting different modes on two otherwise-identical nodes is also the
cleanest way to build an honest before/after demo.

## `counterAxisAlignItems` has no `'STRETCH'` value

To make Auto Layout children fill the container's counter axis, do **not** set
`parent.counterAxisAlignItems = 'STRETCH'` — it throws (`Expected 'MIN' | 'MAX' | 'CENTER' |
'BASELINE'`). Instead set `layoutSizingVertical = 'FILL'` (or `layoutSizingHorizontal`) on each
**child**. Common need: equal-height cards in a row.

---

## Naming: private sub-parts vs the public component

A component whose name has a dotted or underscored **sub-part suffix** (e.g. `Foo.Bar-Group`,
`Foo_Sub-Part`) is usually an internal building block of a larger public component, not something
meant to be instanced directly in a screen.

- `FDS-Stepper.Step-Group` is a **private** single-step unit (no step-count or active-step
  control). The **public** `FDS-Stepper` component set exposes `Steps: 3|4|5`,
  `Direction`, `Theme`, `Style`, `Text` and renders a complete multi-step indicator in one
  instance. Always prefer `FDS-Stepper` for a wizard/progress indicator.
- Other `FDS-Stepper.*` parts (`.Ico-Circle`, `.Step`, `.separator`) are internal pieces of the
  same family — same rule applies.

**Rule of thumb:** when `search_design_system` returns both a bare name (`FDS-Foo`) and one or
more dotted/underscored variants (`FDS-Foo.Bar`, `FDS-Foo_Bar`), inspect the bare one first — it
is almost always the public, composable entry point.

## `FDS-Button-Control-Two` is a 2-button group, not a single secondary button

Despite the plausible name, `FDS-Button-Control-Two` renders as a **pair** of buttons stacked
together (e.g. a cancel/confirm pair), not a single lower-emphasis CTA. Instantiating it for one
button leaves a second, unedited instance showing default placeholder text.

For a single secondary/low-emphasis CTA, use `FDS-Button-Control-One` with `Hierarchy: 'Tertiary'`
instead.

## Never assume a documented variant combination exists

`componentPropertyDefinitions` lists every variant **axis** and its possible values, but not every
cross-product of those values is a real variant. Setting `props` to a combination that doesn't
exist causes Figma to silently fall back to a default/nearest variant, **ignoring every prop you
asked for** — no error is thrown, so this is easy to miss.

**Always do the two-call discovery before calling `setProperties`/`instance({props})` on an
unfamiliar multi-axis `COMPONENT_SET`:**

```js
const setHandle = $fig.get(COMPONENT_SET_KEY);
await $fig.done();
const set = setHandle.node;
return {
  componentPropertyDefinitions: set.componentPropertyDefinitions,
  variants: set.children
    .filter((c) => c.type === "COMPONENT")
    .map((c) => c.variantProperties),
};
```

Then pick a combination that actually appears in `variants`. Example hit: `fds-mini-header` has
42 variants across 4 axes but the naive combo `Left=none, Right=none, Center=logo` does not exist
— the valid neighbours are `Left=none, Right=icon, Center=logo` or `Left=icon, Right=none,
Center=logo`.

## `$fig` scripting — pass separation

Interleaving raw `figma.*` awaits (`getNodeByIdAsync`, `importComponentSetByKeyAsync`, …) between
`$fig.autoLayout`/`$fig.instance` creation calls **in the same loop iteration** produces `Invalid
handle` errors on the later `$fig` call — even though the identical `$fig` call works fine in
isolation. Structure any script that mixes both as three strict passes:

1. **Raw discovery** — collect every node id/index you'll need into plain data. No `$fig` calls.
2. **`$fig` creation** — call every `$fig.autoLayout`/`$fig.instance`/etc. back-to-back with zero
   raw awaits in between, then a single `await $fig.done()`.
3. **Raw mutation** — re-fetch nodes by id, reparent, set text, bind variables.

## `$fig` scripting — `layoutSizingHorizontal`/`Vertical: 'FILL'` ordering

Setting `layoutSizingHorizontal`/`Vertical: 'FILL'` in a node's **initial** `$fig.autoLayout` /
`$fig.instance` / `$fig.text` creation options throws `FILL can only be set on children of
auto-layout frames` if that node has no Auto Layout parent yet (e.g. a wrapper frame built
standalone before being appended elsewhere in Pass C above).

**Fix:** create the node, parent it (`appendChild`/`insertChild`) into its Auto Layout parent,
_then_ set `layoutSizingHorizontal`/`Vertical = 'FILL'` via a plain property assignment on the
real (materialized) node.

## `$fig.variants()` can reset each variant's own hug-sized dimensions, not just their position

The known issue is that `$fig.variants()` stacks variants at (0,0) and you must grid-position
them afterward — but there's a second, easy-to-miss issue: **combining standalone
auto-layout-hugging components into a set can also reset each variant's own width/height** (e.g.
a component that should hug to ~592px collapsed to Figma's default new-node width of 100px),
even though every child inside it still has the correct size and correct token bindings. This
silently breaks the render (content overflows an undersized card) without throwing any error.

**Fix:** after `$fig.variants(...)` + `await $fig.done()`, for **every** variant child, explicitly
compute and set its own size from its actual content (e.g.
`variant.resize(viewport.width + paddingLeft + paddingRight, ...)`) — do not assume a hug-sized
component that looked correct before combining still has the right size after. Do this in the
same pass as the grid-positioning fix.

## Token discipline — `fds`-prefix only

Never bind a fill/spacing/radius property to a variable whose name lacks an `fds` prefix (e.g.
`spacing/spacing-medium`) when an `fds`-prefixed equivalent exists (e.g.
`spacing/fds-spacing/fds-spacing-200`). Verify the prefix before binding — search
`search_design_system` for the `fds-` namespaced token family first, and only fall back to a
non-prefixed token if no `fds` equivalent exists at all (and flag that gap to the user).

## Component "slots" that are actually INSTANCEs — swap, never detach

Some components (e.g. `FDS-Card`) have a single child literally named like a slot (e.g. "Card
Content Slot") but it is an ordinary **INSTANCE**, not a true Figma SLOT node. INSTANCE
descendants are read-only for structural ops, so you cannot `appendChild` real content into it
while the parent stays a live library instance.

> **⚠️ Corrected 2026-08-27 — do NOT `detachInstance()` the outer component.** An earlier version
> of this guidance said to detach; the designer confirmed that un-links the whole component from
> the library, which is worse than the problem it solves. Detaching is **not** the fix.

**Fix:** build your real content as a proper local component (`$fig.component(...)`), then call
`.swapComponent(myComponent)` on the inner placeholder INSTANCE only (e.g. the "Card Content
Slot" child) — never on the outer wrapper. The outer component instance (`FDS-Card`, etc.) stays
fully live/linked to the library; only its inner placeholder's target changes.

See `component-compendium.md` → `FDS-Card` for the worked example. This pattern predates proper
Figma content slots — check whether a newer branch/version of the component has a real slot
first, and prefer that when available.

## Real Figma SLOT nodes exist in this library — and they default to HUG at 100px

`_private.FDS-Tile.variants` has a genuine **SLOT** node (`{content-area}`), not the fake
INSTANCE-placeholder pattern above. Real slots accept `slot.appendChild(node)` directly while the
parent stays a live library instance — no swap, no detach.

**The trap:** a freshly instantiated slot is `layoutSizingHorizontal: 'HUG'` and its
`slotSettings.stretchChildOnInsert` is `false`. If you drop a FILL-sized child into it you get a
circular constraint (child fills parent, parent hugs child) that collapses to **100px** — and
every descendant silently inherits that 100px, even when the outer instance is correctly FILL.

**Fix — set the SLOT itself to FILL before/after inserting, in this order:**

```js
slot.layoutSizingHorizontal = 'FILL';   // the slot, not just the wrapper
wrap.layoutSizingHorizontal = 'FILL';   // then the content you appended
```

Symptom to watch for in a screenshot: inner content (art blocks, dividers) stops short of the
card edge with a blank strip on the right, while the card itself is correctly sized.

## Private (`_private.*`) components cannot be imported by key

`figma.importComponentSetByKeyAsync(key)` / `$fig.instance(key)` both **fail** for `_private.*`
components — that is exactly what "private" means; they are unpublished sub-parts.

**Reach them through an existing instance's main component instead:**

```js
const existing = await figma.getNodeByIdAsync('<id of any instance on the Components page>');
const main = await existing.getMainComponentAsync();
const set = main.parent;                       // the COMPONENT_SET
const variant = set.children.find(c =>
  c.type === 'COMPONENT' &&
  Object.entries(props).every(([k, v]) => c.variantProperties[k] === v));
const inst = variant.createInstance();         // raw API, NOT $fig
```

Because `createInstance()` is a raw call, tile/private-component creation belongs in **Pass C**
(raw mutation), after `await $fig.done()` — see the pass-separation gotcha above.

Ask the designer before using a private component in production work; on 2026-08-27 the designer
explicitly approved using `_private.FDS-Tile.variants` directly ("just use private wrapper")
because no public wrapper exists.

## `FDS-Tile` `Featured=True` is a LIGHT surface — do not use `on-primary` text

`Featured=True, Gradient=True` renders `fds-surface-variant` (white) plus an **orange gradient at
10 % opacity** — it is a pale, tinted card, *not* a saturated orange one. Putting
`fds-on-primary` (white) text on it makes the content invisible.

Use `fds-on-surface-hi` for the title, `fds-primary` for the accent/amount, `fds-on-surface-m`
for supporting copy. Always screenshot a Featured tile before trusting a text colour on it.

## `setEffectStyleIdAsync` destroys an effect style the component already carries

Effect styles are **one per node**. `FDS-Tile` with `Featured=True` already ships
`fds-specular-const-emission-primary` (its signature glow). Calling `setEffectStyleIdAsync(elevation)`
on it silently replaces the glow — the tile stops looking Featured.

**Always read `node.effectStyleId` first** and resolve its name before overwriting:

```js
const cur = node.effectStyleId ? (await figma.getStyleByIdAsync(node.effectStyleId))?.name : null;
```

If the node already has a meaningful style, leave it alone and express your hierarchy elsewhere.
On 2026-08-27 the fix was: elevation-heavy on the plain grid tiles, hero keeps its emission —
which reads as better hierarchy anyway.

## A single error rolls back the WHOLE `use_figma` run — including errors in the `return`

`use_figma` executes atomically. If **any** line throws, every mutation from that run is reverted,
even ones that already "succeeded". Twice on 2026-08-27 a run appeared to apply and did not.

The nastiest version: a stale node reference **in the return statement**. After
`instance.swapComponent(...)`, the old node id is dead — reading `inner.componentProperties`
afterwards throws `Node with id "..." not found` and silently undoes all the real work.

**Rules:**
- Never read from a node after `swapComponent()` / `setProperties()` re-created it — re-find it.
- Keep the `return` to primitives collected *before* any swap, or return a plain literal.
- After any run that errors, **re-verify actual state** before assuming a partial apply.

## Prefer `FDS-input-V2.Flair` over `FDS-Input` for Flair work

`FDS-input-V2.Flair` (component_set, local to the Components page) is the Flair-native input.
Axes: `Assistive Text` (False/True) · `Context` (surface-variant/surface/alternate-surface/
alternate-surface-variant) · **`Elevation` (False/True)** — the elevation axis is the reason to
use it over the older `FDS-Input`.

It is a local component set, so `importComponentSetByKeyAsync` is unnecessary — find it on the
Components page and `createInstance()` off the matching variant.

Configuring it has three traps:

1. **The inner content instance uses `'True'`/`'False'`, not `'On'`/`'Off'`** (unlike `FDS-Input`):
   ```js
   search.findOne(n => n.name === '_private.Fds-input-V2.{content}').setProperties({
     Prefix: 'False', Suffix: 'False', 'Leading Icon': 'True', Placeholder: 'True',
     '{text}#42412:0': 'Search games',
   });
   ```
2. **`State` is misspelled `Placeholer` in the library** (not `Placeholder`) and lives on the
   nested `_private.FDS-input-V2`, not on the Flair wrapper.
3. **The `{label}` frame and `{trailing-icon-set}` render by default** ("Label" + a clock icon)
   even when the label text property is `""`. Set `.visible = false` on both for a search field.

Default leading icon is `account_circle` — `swapComponent()` it with `header/search`
(`737bb872e0d7ce0574d2bb85cb8c6ee9d1809216`) for a search field.

## Typography — always use a real text style, never a guessed font

Do not hand-pick `fontName`/`fontSize` on `$fig.text()` from memory or convention (e.g. "Inter
Bold 24px" for a heading) — verify the actual brand font and type ramp first. This library's
real type styles live in `[Lib]: FDS Design Tokens` (font family **Open Sans**, not Inter) as
`Display/fds/fds-display-*` (headings) and `Paragraphs/fds/fds-paragraphs-*` (body/subtext) text
styles — see `component-compendium.md` → Typography for the full ramp + keys.

**Fix:** `const style = await figma.importStyleByKeyAsync(key); node.textStyleId = style.id;`
after the text node is created — never set `fontName`/`fontSize` directly when a matching `fds-*`
text style exists. Only fall back to raw font properties when no text style covers the case, and
flag that gap rather than guessing a size.

**The right category is `Headline`, not `Display`.** `Display/fds/fds-display-*` (36–56px) is
for large marketing/hero text. For a normal in-app section/card heading, use
`Headline/fds/fds-headline-*` instead — `fds-headline-regular` (24px Bold Open Sans) is the
default pairing with `fds-paragraphs-regular` (14px) for the subtext underneath it. Confirmed
2026-08-27 after initially missing this category (searched "heading"/"title", the actual name is
"headline").

**Multi-brand warning:** the same style names are duplicated across brand-specific library
variants (e.g. `- Realm`, `- Alta`, `- Web3`). Always scope to the base library key actually
subscribed in the working file (check `get_libraries`) — never a brand-suffixed variant unless
the project is explicitly that brand.

## Canvas/page clipping — check `clipsContent` + width before placing new screens

A parent canvas/page FRAME commonly has `clipsContent: true`. Placing new screens at an `x`
beyond the parent's current `width` renders them **blank/collapsed in `.screenshot()`** even
though the new screen's own `width`/`height` are completely correct — the clip happens at render
time, not at the node's own geometry.

**Fix:** before placing screens side-by-side on an existing canvas, read the parent's `width` and
`clipsContent`. If the new screens would extend past the current width, `resize()` the parent
frame first (e.g. `canvas.resize(newWidth, canvas.height)`) — don't discover this via a confusing
blank screenshot after the fact.

## Always set FILL on every nested instance, not just wrapper frames

It's not enough to set `layoutSizingHorizontal: 'FILL'` on wrapper frames (`Content`, `Fields`,
`Consents`, `Heading Group`, etc.) — **every individual instance placed directly inside an
Auto Layout frame** (header, stepper, each input, each checkbox, the CTA button) also needs its
own `layoutSizingHorizontal = 'FILL'`, or it silently falls back to `HUG` and can render narrower
than the parent even though the wrapper itself is full width. This is easy to miss because a
few components happen to default to a width close to the container, masking the gap until you
compare against a properly-filled sibling.

**Fix:** after building a screen, walk every direct child of every Auto Layout container
(`Content`, `Fields`, `Consents`, etc.) and explicitly set `layoutSizingHorizontal = 'FILL'` on
each — don't rely on setting it only on the container or only on some of its children.

## Mobile — `FDS-Button-Control-Two`/`Three` must use `Stacking: 'Vertical'`

On mobile widths (the default for HUGIN drafts), a 2-or-3-button control laid out
`Stacking: 'Horizontal'` (side-by-side) is too cramped — each button ends up too narrow. Confirmed
2026-08-27: **always use `Stacking: 'Vertical'`** for `FDS-Button-Control-Two`/`Three` on mobile,
regardless of which two buttons are paired (Continue+Back, Start playing+Go to account, etc.).
Horizontal stacking may still be correct for wider (tablet/desktop) breakpoints — ask if the
target isn't mobile.
