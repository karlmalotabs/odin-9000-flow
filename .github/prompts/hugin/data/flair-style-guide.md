# Flair — Design Language Style Guide

<!-- schema-version: 2 -->

> **Flair is a mode, not a fork.** It is not a separate component library and not a set of
> one-off overrides. It is the visual result of binding components to the `var/fx/*` effect
> tokens and then viewing them in the **Betsson Light** or **Betsson Dark** brand mode. The same
> component, same bindings, viewed in **Betsson Legacy** or a white-label brand, resolves those
> same tokens to _transparent_ and renders flat. Flair switches on and off at the mode layer.
>
> **All values in this guide are resolved in Betsson Light (`24:1`) / Betsson Dark (`24:2`)** —
> the modes Flair is authored for. Confirmed by the designer, 2026-08-27.
>
> Derived from: **Moodboard** (`Flair Workshop Playground`, node `312:118765` — visual analysis)
>
> - **structural inspection** of live instances in `Odin-test` `96:1217`
>   (`FDS-Button-Update_V2`, `FDS-input-v2`, `FDS-Progress-Bar-V2`, `FDS-Badge`, `Snackbar`,
>   `FDS-Popover`, `Notification banner`, `_private.FDS-Tile.variants`) + deep token resolution of
>   the whole `var/fx/*` family across all 8 Core Brands modes.

---

## The story (read this first)

Flair is what happens when flat design remembers it lives in a world made of light.

Every surface still obeys the system — the same disciplined radius scale, the same restrained
palette, the same clean geometry we always demanded. Nothing about Flair breaks the rules. But
look closer, and every rounded edge catches a sliver of light along its top and lets go of a
sliver of shadow beneath — a whisper of gloss, never a shout. We call it **specular**, and it is
the difference between a button that sits on a screen and a button that sits on a screen and
_invites your thumb_.

Nothing in Flair floats without reason — and here the system says something counterintuitive and
exactly right. A **heavy** shadow is a _tight_ one: a single dark anchor pinning an element low
to the canvas. A **light** shadow is a _long_ one, thrown wide with negative spread so a modal can
hover far above the page without smearing the edges beneath it. The heavier the shadow, the lower
it sits. The lighter the shadow, the higher it floats. Three names — heavy, medium, light — and a
whole vocabulary of altitude, built from the same three ink wells at four, six and eight percent.

And every one of those surfaces, without exception, is drawn with a single fine line — ten
percent black, fifteen percent white in the dark — so that even a solid block of colour still
knows exactly where it ends.

Then the details nobody asks for and everybody trusts: a label carrying its own faint shadow so
white text never dissolves into orange. A prefix at thirty-eight, a value at sixty, a heading at
eighty-seven — emphasis tuned not merely by _which_ colour, but by exactly how much that colour
is permitted to speak. And in the dark, every one of those numbers quietly rises — sixty becomes
seventy-four, ten becomes fifteen — because light on dark carries less far, and Flair would rather
do the arithmetic than let you squint.

Here is the quiet trick, the thing worth telling every engineer and every product owner in the
room: **none of this is painted on.** There is no Flair component and no Flair fork. There is one
button, bound to the same tokens it was always bound to. Change the brand mode and the gloss
arrives — or leaves — without a single layer being touched. Legacy stays flat. White labels stay
flat. Betsson steps into the light. One system, one component, one source of truth, wearing the
face the brand asked for.

That is the promise: **Flair costs you nothing structural and gives you back the two percent.**
And the two percent is the whole style.

---

## The Flair switch — the four tokens that toggle

These four resolve to **fully transparent in Betsson Legacy** and to real values in **Betsson
Light/Dark**. They _are_ Flair. Everything else in the system is shared baseline.

| Token                                                   | Betsson Light  | Betsson Dark   | Betsson Legacy  | Role                                     |
| ------------------------------------------------------- | -------------- | -------------- | --------------- | ---------------------------------------- |
| `var/fx/specular/fds-fx-specular-matte`                 | `#ffffff @30%` | `#ffffff @30%` | **transparent** | Top highlight (everyday gloss)           |
| `var/fx/specular/fds-fx-specular-matte-shadow`          | `#000000 @12%` | `#000000 @12%` | **transparent** | Paired recessed edge                     |
| `var/fx/specular/fds-fx-specular-gloss`                 | `#ffffff @38%` | `#ffffff @38%` | **transparent** | Stronger highlight (high-shine surfaces) |
| `var/fx/elevation/fds-fx-elevation-text-on-btn-default` | `#000000 @24%` | `#000000 @24%` | **transparent** | Label shadow on saturated fills          |

**Consequence for building:** always _bind_ these tokens rather than hardcoding the equivalent
literal shadow. A hardcoded white-30% inner shadow will render in Legacy and every white-label
brand, breaking them. A bound token silently disappears where it should. **This is the single
most important rule in the guide.**

### ⚠️ Set the mode, or Flair is invisible

The **Core Brands** collection's default mode is `24:0` **Betsson Legacy** — where all four switch
tokens resolve to transparent. A frame built without an explicit mode therefore renders **flat**,
and it looks like the effects "didn't work." They did; the mode is just wrong.

```js
const collection = await figma.variables.getVariableCollectionByIdAsync(
  someVar.variableCollectionId,
);
frame.setExplicitVariableModeForCollection(collection, "24:1"); // Betsson Light
// '24:2' Betsson Dark · '24:0' Betsson Legacy
```

Mode IDs: `24:0` Legacy · `24:1` Light · `24:2` Dark · `24:3` Jalla · `24:4` Star Casino ·
`24:5` Betsafe · `24:6` Casino Euro · `24:7` Nordicbet.

This also makes an **honest side-by-side demo trivial**: build one component, duplicate it, and
set the two copies to different modes. Identical `effectStyleId`, genuinely different render —
the thesis proves itself on canvas. (Used on Slide 1 of the Flair presentation, Page 3.)

---

## The elevation ladder — always on, in every mode

**Use the composite effect _styles_, not the raw colour variables.** `fds-fx-elevation-on-surface-a/b/c`
are **per-layer reference colours**, not intensity tiers — they are the ink each shadow layer is
drawn with. The things you actually apply are the three `fds-elevation-const` effect styles:

| Effect style                                                        | Layers    | Geometry                                                 | Meaning                                                                                 |
| ------------------------------------------------------------------- | --------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `fds-elevation-const/on-surface/fds-elevation-const-surface-heavy`  | **a**     | `(0,4)` blur 4                                           | Tight, single-layer anchor. Element sits **low** on the canvas.                         |
| `fds-elevation-const/on-surface/fds-elevation-const-surface-medium` | **a + b** | `(0,4)` blur 8 &nbsp;+&nbsp; `(0,8)` blur 16, spread −2  | Balanced penumbra/umbra stack. Standard cards and sections.                             |
| `fds-elevation-const/on-surface/fds-elevation-const-surface-light`  | **a + c** | `(0,4)` blur 8 &nbsp;+&nbsp; `(0,12)` blur 24, spread −4 | Low-density, **high-float**. Modals and popovers; negative spread prevents muddy edges. |

Layer colours (constant across all 8 modes — elevation is **not** Flair-gated):

| Colour token                                     | Value         |
| ------------------------------------------------ | ------------- |
| `var/fx/elevation/fds-fx-elevation-on-surface-a` | `#000000 @4%` |
| `var/fx/elevation/fds-fx-elevation-on-surface-b` | `#000000 @6%` |
| `var/fx/elevation/fds-fx-elevation-on-surface-c` | `#000000 @8%` |

> **⚠️ The naming is inverted from intuition.** _Heavy_ = heavy/dense shadow = element sits **low**.
> _Light_ = light/diffuse shadow = element floats **high**. Do not read "heavy" as "most
> elevated" — it is the opposite. Pick by intent: anchored → heavy, card → medium, overlay → light.

---

## Specular — the signature, in detail

Two composite effect styles, and the choice between them is about **edge quality**:

| Effect style                                        | Layers                   | Geometry                                                                  | Use for                                              |
| --------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `fds-specular-const/matte/fds-specular-const-matte` | matte-shadow **+** matte | `(-1,-1)` blur **0**, spread 1 &nbsp;+&nbsp; `(0,1)` blur **0**, spread 1 | **Sharp / crisp glass edges** — hard 1px bevel lines |
| `fds-specular-const/gloss/fds-specular-const-gloss` | gloss (single)           | `(1,1)` blur **2**, spread 0                                              | **Soft / rounded edges** — a diffuse specular catch  |

**The distinction:** _matte_ uses `blur: 0` — two hard 1px lines that read as a **sharp, faceted
glass edge**. _gloss_ uses `blur: 2` — a single soft highlight for **softer, rounder** surfaces.
Match the specular to the geometry of the shape: crisp edges take matte, soft edges take gloss.

Observed: matte on `FDS-Button-Update_V2` `{content}` and `FDS-Badge`.

### Emission (the halo) — semantic, and _not_ mode-gated

`DROP_SHADOW` at offset (0,0), radius 12, spread 2 — a soft coloured glow around the shape.
Unlike matte/gloss, emission renders in **every** mode:

| Token                              | Value (all modes) |
| ---------------------------------- | ----------------- |
| `fds-fx-specular-emission-primary` | `#ff6600 @35%`    |
| `fds-fx-specular-emission-alert`   | `#f8a127 @35%`    |
| `fds-fx-specular-emission-error`   | `#dd2727 @35%`    |
| `fds-fx-specular-emission-info`    | `#1c8bf6 @35%`    |

Observed on `_private.FDS-Tile.variants` (a featured/hero tile). There is **no
`emission-success`** — if a positive-state glow is needed, that's a gap to raise, not to invent.
Use emission sparingly: matte is Flair's speaking voice, emission is its raised one.

### Text-on-button shadow

Two composite styles, matching the button's fill:

| Effect style                                                              | Layer colour                           | Geometry       |
| ------------------------------------------------------------------------- | -------------------------------------- | -------------- |
| `fds-elevation-const/text-on-btn/fds-elevation-const-text-on-btn-default` | `fds-fx-elevation-text-on-btn-default` | `(1,1)` blur 0 |
| `fds-elevation-const/text-on-btn/fds-elevation-const-text-on-btn-accent`  | `fds-fx-elevation-text-on-btn-accent`  | `(1,1)` blur 0 |

### Tone — the light/dark adaptive overlay

`var/fx/tone/fds-fx-tone`: `#ffffff @30%` in Light, **`#000000 @12%` in Dark**. A general-purpose
overlay that flips polarity with the theme — lighten on light, darken on dark.

---

## Dark mode is not an inversion — the opacities are _boosted_

A genuinely sophisticated detail, and easy to get wrong by hand: light-on-dark reads with less
perceived contrast, so Flair compensates numerically rather than reusing the same alphas.

| Token                      | Betsson Light  | Betsson Dark   | Note            |
| -------------------------- | -------------- | -------------- | --------------- |
| `fds-on-surface-hi`        | `#000000 @87%` | `#ffffff @87%` | unchanged       |
| `fds-on-surface-m`         | `#000000 @60%` | `#ffffff @74%` | **boosted +14** |
| `fds-on-surface-low`       | `#000000 @38%` | `#ffffff @48%` | **boosted +10** |
| `fds-stroke-ui-on-surface` | `#000000 @10%` | `#ffffff @15%` | **boosted +5**  |
| `fds-info`                 | `#608df2`      | `#43a1f7`      | brightened      |
| `fds-alert`                | `#f8a127`      | `#f9b356`      | brightened      |
| `fds-error`                | `#f9554d`      | `#f9554d`      | unchanged       |
| `fds-primary`              | `#ff6600`      | `#ff6600`      | unchanged       |

**Surface polarity also inverts its relationship:** in Light, `surface` `#f7f7f7` is _darker_ than
`surface-variant` `#ffffff`; in Dark, `surface` `#1b1d2b` is _lighter_ than `surface-variant`
`#121422`. The constant is the **role**: `surface` = page background, `surface-variant` = the card
sitting on it. Always pick by role, never by "which one is lighter."

---

## Radius — role-specific families, not one shared ramp

Flair does not reuse a generic `fds-round-*` scale. Each component **role** owns a family:

| Role                          | Token                                                              | Value |
| ----------------------------- | ------------------------------------------------------------------ | ----- |
| Buttons                       | `fds-round-const/ui-controls/btn/fds-round-const-btn-lg`           | 16    |
| Pills (badge, progress track) | `fds-round-const/utilities/fds-round-const-ui-pill`                | 9999  |
| Containers (banner, tile)     | `fds-round-const/containers/standard/fds-round-const-container-lg` | 20    |
| Cards (snackbar)              | `fds-spacing-const/container/fds-spacing-const-container-card`     | 20    |
| Inputs                        | `fds-border-radius/fds-border-radius-input-default`                | 8     |

> The snackbar's radius is bound to a **spacing**-named token — a naming inconsistency in the
> source system, not a Flair intention. Don't replicate the pattern in new work; don't "fix" the
> existing binding without asking.

---

## Colour language (Betsson Light / Dark)

| Role                   | Token                                    | Light          | Dark      |
| ---------------------- | ---------------------------------------- | -------------- | --------- |
| Primary / CTA          | `fds-primary`, `var/btn/fds-btn-default` | `#ff6600`      | `#ff6600` |
| On primary             | `fds-on-primary`, `fds-on-btn-default`   | `#ffffff`      | `#ffffff` |
| **Confirm / positive** | `fds-success`                            | `#00aa41`      | `#00aa41` |
| On success             | `fds-on-success`                         | `#000000 @87%` | `#ffffff` |
| Page background        | `fds-surface`                            | `#f7f7f7`      | `#1b1d2b` |
| Card / field           | `fds-surface-variant`                    | `#ffffff`      | `#121422` |
| Accent tint            | `fds-surface-accent`                     | `#fff0e7`      | `#272a3d` |
| Success tint           | `fds-success-surface`                    | `#d8f2d7`      | `#335315` |
| Alert tint             | `fds-alert-surface`                      | `#fce7d7`      | `#7b511b` |
| Error tint             | `fds-error-surface`                      | `#ffe0e8`      | `#6d161b` |
| Info tint              | `fds-info-surface`                       | `#e3e8ff`      | `#12477a` |
| Focus ring             | `fds-stroke-ui-focus-ring`               | `#ff6600`      | `#ff6600` |

Blur scale (for glass/scrim treatments): `fds-blur-sm` 12, `fds-blur-md` 24, `fds-blur-lg` 32.

---

## The universal hairline — non-negotiable

**Every surface in Flair carries a stroke.** Not "most" — every one. It is always a fine line
bound to **`var/fds/fds-on-surface-ulow`**, at `1–1.5px`.

| Token                                    | Betsson Light                        | Betsson Dark   |
| ---------------------------------------- | ------------------------------------ | -------------- |
| `var/fds/fds-on-surface-ulow`            | `#000000 @10%`                       | `#ffffff @15%` |
| `var/stroke/ui/fds-stroke-ui-on-surface` | → _aliases to `fds-on-surface-ulow`_ | → _same_       |

The stroke-scoped alias `fds-stroke-ui-on-surface` resolves to exactly the same primitive
(`ref/text/black/opacity10` → `ref/text/white/opacity15`), so either binding is correct —
`fds-on-surface-ulow` is the root semantic token, and the `stroke/ui/` alias simply carries a
stroke scope. Do **not** hardcode `black @10%`.

This is the easiest part of Flair to omit and the most obvious when missing: without it, a solid
fill has no edge, and the whole surface reads cheap. **If you build a Flair surface and it has no
stroke, it is not finished.**

---

## Micro-polish — the two percent

- **The hairline stroke on every surface** — see the section above. This is rule zero.
- **Text on saturated fills gets its own shadow** — bind
  `fds-fx-elevation-text-on-btn-default`, never a literal.
- **Emphasis = token _and_ opacity together.** `FDS-input-v2` uses `fds-on-surface-low` for
  prefix/suffix and `fds-on-surface-m` for the value — distinct felt weights from one family.
- **Accent affordances take brand colour directly** — the input's focus-state visibility toggle
  is filled `fds-primary`, not a neutral.
- **Gradients are a "this one is special" signal**, not a base material. Observed only on
  `FDS-Badge` (gradient fill) and the hero tile (gradient fill _and_ gradient border + emission).

---

## Applying Flair to something new — checklist

1. **Bind, never hardcode**, the four Flair-switch tokens — a literal shadow leaks into Legacy
   and every white-label brand.
2. **Add the hairline stroke.** `fds-on-surface-ulow` at 1–1.5px, on every surface, no exceptions.
3. Pick the radius family matching the component's **role** (control / pill / container / input).
4. Pick the elevation by **intent, not by name**: anchored-low → `-heavy`, standard card →
   `-medium`, floating overlay → `-light`. Apply the composite effect _style_, not raw a/b/c.
5. Solid-fill accent surface (button, badge, pill)? Add specular, chosen by **edge quality**:
   sharp/crisp edges → `-matte` (hard 1px bevel), soft/rounded edges → `-gloss` (blurred catch).
6. Featured/hero? → gradient fill/border + **emission** glow, _instead of_ specular.
7. Text on a saturated fill → bind the matching `text-on-btn` style (`-default` or `-accent`).
8. Pick surfaces by **role** (`surface` = page, `surface-variant` = card), never by lightness —
   the relationship inverts in dark mode.
9. **Verify in both Betsson Light and Betsson Dark before calling it done**, and glance at Legacy
   to confirm it degrades gracefully to flat.

---

## "It doesn't look Flair" — the diagnosis

The most common failure is a layout that uses only correct *tokens* and reads completely flat.
Correct colour is not Flair. **Flair is depth.** If something looks plain, check in this order:

1. **Is there elevation at all?** This is the number-one cause. A card with the right fill, the
   right radius and the right hairline still looks like a wireframe until it casts a shadow.
   Library components frequently ship with **no** elevation — you are expected to add it.
2. **Is the accent warm, or is it grey?** Flair leans on `fds-surface-accent` (`#fff0e7`) and
   `fds-primary` for interior blocks. A neutral grey panel reads as generic; the same block in
   surface-accent with a primary-tinted icon reads as Flair.
3. **Are dividers doing work a shadow should do?** A hard 1px rule inside a card is a flat-design
   habit. Delete it and let elevation + a tonal fill change separate the regions instead.
4. **Do round elements have specular?** Pills and circular controls without `-gloss` look unlit.
5. **Is there a hierarchy of depth, or is everything on one plane?** Two different elevations
   (or elevation vs. emission) is what makes a screen feel composed rather than tiled.

**Reference recipe — `FDS-Carousel` (the canonical Flair object):**

| Part | Treatment |
| --- | --- |
| Container | radius `container-lg` (20) + 1.5px hairline + `elevation-surface-heavy` + solid fill |
| Pill controls | radius `pill` (40) + 1.5px hairline + `specular-gloss` (inner shadow) |
| Container specular | **none** — specular is for the controls, not the shell |

Applied to a game grid (2026-08-27): tiles got `elevation-heavy` (tight, anchored — right for a
dense grid), the hero kept its `emission-primary` glow, art blocks moved from grey to
`surface-accent` with `fds-primary` icons, and the interior divider was deleted. Same tokens as
before, but it stopped looking flat.

---

## Confirmed answers to previously-open questions

- **The moodboard green is `var/fds/fds-success` = `#00aa41`** (identical in Light and Dark),
  paired with `fds-on-success`. There is no `emission-success` counterpart.
- **`Notification banner`'s fill is a genuine binding gap.** Its literal `#e3e8ff` is an _exact_
  match for `fds-info-surface` in Betsson Light, but it is **not bound** to that variable — so it
  will not adapt to Betsson Dark (where `fds-info-surface` is `#12477a`). Recommend binding it;
  flagged for the designer rather than silently changed.
- **Three elevation rungs exist** as composite styles — `-heavy` (1 layer), `-medium` (2 layers),
  `-light` (2 layers) — and `a`/`b`/`c` are the **per-layer reference colours**, not tiers.
  Naming is inverted from intuition: heavy = low float, light = high float.
- **`-matte` vs `-gloss` is an edge-quality choice**, not an intensity one: matte (`blur:0`) for
  sharp glass edges, gloss (`blur:2`) for soft ones.
- **Every Flair surface carries a `fds-on-surface-ulow` hairline stroke** — and
  `fds-stroke-ui-on-surface` is confirmed to be a stroke-scoped alias of exactly that token.

## Still open (ask before assuming)

- Should `fds-fx-tone` be applied routinely (hover/pressed overlays), or is it special-case?
- Is there an intended positive/success **glow**, given `emission-success` doesn't exist?
- When is `text-on-btn-accent` used instead of `-default` — strictly on `Color=Accent` button
  variants, or wider?
- The older `fds-elevation-on-surface-01/02/03` effect styles (5-layer, **unbound raw colours**)
  still exist alongside the new `fds-elevation-const-*` ones. Are they deprecated legacy, and
  should new Flair work always use the `-const` family?
