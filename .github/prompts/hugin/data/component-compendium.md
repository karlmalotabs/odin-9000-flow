# Component Compendium

<!-- schema-version: 1 -->

> The persistent, growing knowledge base of "how to actually use" each DS Fabric Components
> library component — built incrementally by scanning the library and asking the designer,
> not by guessing. **Read this file FIRST in HUGIN's discovery step** before any live
> `search_design_system` call; only fall back to live discovery on a miss, and when you resolve
> a miss, add the answer back here.
>
> Source library for full enumeration: **"🧣 DS Fabric Components (WIP)"**, file key
> `Dli7JA3N6vuTTYi4lD9qMF`. Use `list_file_components_for_code_connect(fileKey)` to list every
> published component (623 at last scan) in one call — far cheaper than guessing
> `search_design_system` queries one category at a time.

## Entry schema

```md
### <Component name>

- **Key:** componentKey (component_set) or a representative variant key
- **Purpose:** one line — what it's for / when to use it
- **Variant axes:** name → options (only ones actually confirmed to combine — see gotchas)
- **Content overrides:** which nested TEXT/INSTANCE nodes to override, and how (characters vs setProperties)
- **Token/style pairing:** which fds-\* variable(s) / text style(s) it expects around it
- **Status:** `confirmed` (designer-verified) | `inferred` (agent-derived, unverified) | `open-question`
- **Gotchas:** cross-ref `component-gotchas.md` if applicable
```

**`CANONICAL … SPEC (locked)`** in a heading is stronger than `confirmed`: the design is settled
and must be reproduced verbatim — no discovery, no alternatives offered, no variations proposed.
Adapt only content-level details (count, copy, width). Currently locked: **FDS-Carousel**.

---

## Confirmed entries

### FDS-Card

- **Key:** `4ac740264dcf3395986989ad0d544096d24f9983` (component_set)
- **Purpose:** elevated surface/container. Current published version has **no real content
  slot** — its only child, "Card Content Slot", is a placeholder INSTANCE (a newer version
  with a true Figma content slot exists on a separate branch, not yet published here).
- **Variant axes:** `Elevation` (none/low/medium/high), `Theme` (surface/alternate-surface/
  surface-variant), `Padding` (No/Yes)
- **Content overrides:** **Do NOT `detachInstance()`** — that un-links the whole card from the
  library (confirmed anti-pattern, corrected 2026-08-27). Correct pattern: build your real
  content as a proper local component (`$fig.component(...)`), then call
  `cardContentSlotInstance.swapComponent(myComponent)` on the inner "Card Content Slot"
  instance only. The outer `FDS-Card` instance stays fully live/linked to the library.
- **Token/style pairing:** see Typography below for any text placed inside.
- **Status:** `confirmed` (designer clarified 2026-08-27; historically the team also used this
  swap approach pre-content-slots, noted as "not great practice long-term" — revisit once the
  content-slot branch is published)
- **Gotchas:** `component-gotchas.md` § "Component slots that are actually INSTANCEs"

### Typography — Display / Paragraphs text styles

- **Library:** `[Lib]: FDS Design Tokens` (key `lk-f1f39740f68a0938825ad9ac446f29cc51482c1a7219bd0434e34e69fe3062e1060180556b6e66ae32ddad4017fed27d3ab46603e5f691d7c171204e0c095893`)
- **Font family:** **Open Sans** — not Inter. Every heading/subtext built before 2026-08-27
  used hardcoded Inter and needs correcting.
- **Rule:** always apply `node.textStyleId = (await figma.importStyleByKeyAsync(key)).id` —
  never hand-pick `fontName`/`fontSize` on `$fig.text()`.
- **Display (Bold, headings):**

  | Style                 | Key                                        | Size / line-height |
  | --------------------- | ------------------------------------------ | ------------------ |
  | `fds-display-tiny`    | `79e812086b4602c941f9fee0ff577dd75aff9646` | 36px / 56          |
  | `fds-display-small`   | `1298f327241672821491701c5d61bd6e42b3291b` | 40px / 56          |
  | `fds-display-regular` | `a1815b4fd6d2a7dcaca827c1c68d55d1c9f935cf` | 48px / 65          |
  | `fds-display-lead`    | `783ec56815ef531a5f92797408ba066792d3ecbb` | 56px / 80          |

- **Paragraphs (Regular, body/subtext):**

  | Style                    | Key                                        | Size / line-height |
  | ------------------------ | ------------------------------------------ | ------------------ |
  | `fds-paragraphs-micro`   | `f6a4cc0532d3e16bcb9a0bfcd1a8fa8a107028cb` | 8px / 12           |
  | `fds-paragraphs-tiny`    | `ff36ad38a8bd17abc9952805a8570a7014232bb3` | 10px / 16          |
  | `fds-paragraphs-small`   | `4d35bd6c9849f972ecf0c62eeb9dde5f9daa579e` | 12px / 16          |
  | `fds-paragraphs-regular` | `11f3aa5b57ab8b8923897d1536bff5f27ebbb775` | 14px / 20          |
  | `fds-paragraphs-lead`    | `53261f70ad095a9b4e13adb7ec4f7c3d0af3993e` | 16px / 24          |

- **Headline (Bold, section/card headings — the correct category for compact in-app headings, confirmed 2026-08-27):**

  | Style                  | Key                                        | Size / line-height |
  | ---------------------- | ------------------------------------------ | ------------------ |
  | `fds-headline-tiny`    | `152b6bfadc287e484617763b88feee41d5323922` | 16px / 24          |
  | `fds-headline-small`   | `40f31265cdd9cc28406bc59b187e1cebbc22d304` | 20px / 32          |
  | `fds-headline-regular` | `bd2c297f1cdb67187490d206b3fe45d07d299717` | 24px / 32          |
  | `fds-headline-lead`    | `0fbdc89cfe8ab20dfeecb4720465047eefec399c` | 32px / 40          |

- **Default pairing for a screen/card heading + subtext:** `fds-headline-regular` (heading) +
  `fds-paragraphs-regular` (subtext). **`Display/fds/fds-display-*` is for large marketing/hero
  text, not in-app section headings** — don't reach for it by default.
- **Status:** `confirmed` (2026-08-27) for the Headline ramp + default pairing. All 6 screens
  built before this date used hardcoded Inter and have been retrofitted to
  `fds-headline-regular`/`fds-paragraphs-regular`.
- **Multi-brand warning:** the same style names exist duplicated across brand-specific
  library variants (`- Realm`, `- Alta`, `- Web3`, `- Merchant`, `- Core Brands Group B`,
  `- 2`). Always scope `search_design_system`/imports to the base
  `[Lib]: FDS Design Tokens` key above (the one actually subscribed in the working file) —
  never a brand-suffixed variant unless the project is explicitly that brand.

---

### FDS-Stepper — per-step state (confirmed 2026-08-27)

- **Set key (Steps=4/horizontal/on-surface/Ico/Text=true):** `372227491fa73d1abb70a121190f046111b03366`
- **Structure:** a `Steps=4` instance has 4 children — the first 3 are `FDS-Stepper.Step-Group`
  instances (each = one `FDS-Stepper.Step` + a `Separator Group` connector), the 4th is a bare
  `FDS-Stepper.Step` (no connector after the last step).
- **Per-step state:** each `FDS-Stepper.Step` contains an `FDS-Stepper.Ico-Circle` instance with
  a `Color` variant: `Success` (done) / `Info` (current) / `Grey` (upcoming) / `Warning` (error).
  Set it directly via `icoCircle.setProperties({ Color })` — this is a property override on an
  already-existing nested instance, not a structural op, so it's safe on INSTANCE descendants.
- **Connector lines need their own fix:** each `Separator Group` → `FDS-Stepper.separator`
  instance has its own `Color` axis (`success`/`info`/`warning`/`surface`/`alternate-surface`,
  default `success`) — it does **not** auto-follow the step circles' color. Set segment _i_
  (between step _i_ and _i+1_) to `success` if step _i_ is complete, else `surface`, or the
  connector lines stay green regardless of actual progress.
- **Per-step caption:** each step's `Step` TEXT node — override with a short word (e.g.
  `Account`/`Details`/`Contact`/`Done`), not left as the default placeholder "Step".
- **Worked example:** see `.github/prompts/hugin/hugin.prompt.md` conversation history 2026-08-27
  registration-flow rebuild — `ACTIVE_IDX` per screen drives `Success`/`Info`/`Grey` + matching
  separator colors.

### FDS-Button-Control-Two — confirmed 2026-08-27

- **Purpose:** a **Primary + Tertiary button pair** in one instance — use it whenever a screen
  needs 2 buttons together (e.g. Continue+Back, or a primary+secondary CTA pair). For a single
  button, use `FDS-Button-Control-One` instead (`Two` is never a single button — see the
  correction below).
- **Structure:** contains two nested instances — `Button 1` (defaults to `Type=Primary`) and
  `Button 2` (defaults to `Type=Tertiary`), each with its own `Button Label` TEXT node override
  via `.findOne(n => n.name === 'Button 1'|'Button 2').findOne(TEXT).characters`. The default
  variant combo (`Button 1=Primary`, `Button 2=Tertiary`) already matches a standard
  primary+secondary CTA pairing — no need to change either nested button's own variant props
  for the common case.
- **Top-level props used:** `Hierarchy: 'Strong'`, `Context: 'on-surface'`, `Stacking:
'Horizontal'` (side-by-side) or `'Vertical'` (stacked — used on the Confirmation screen for
  Start playing/Go to account), `Size: 'Large'`, `ButtonWidths: 'Stretched'`.
- **⚠️ Mobile rule (confirmed 2026-08-27):** always use `Stacking: 'Vertical'` on mobile widths
  — horizontal side-by-side is too cramped for two full-width buttons on a phone screen. This
  applies to `FDS-Button-Control-Three` too if/when used. Only consider `'Horizontal'` for
  tablet/desktop breakpoints, and ask first.

### Always FILL every nested instance (confirmed 2026-08-27)

Setting `layoutSizingHorizontal: 'FILL'` on wrapper frames (`Content`, `Fields`, `Heading Group`,
etc.) is not sufficient — every individual instance placed directly inside an Auto Layout frame
(header, stepper, each input/checkbox, the CTA button) needs its own `layoutSizingHorizontal =
'FILL'` too, or it silently defaults to `HUG` and can end up narrower than its container. Walk
every direct child of every Auto Layout container after building and set FILL explicitly — see
`component-gotchas.md` for the fix pattern.

### FDS-Carousel — CANONICAL FLAIR SPEC (locked 2026-08-28)

> **If asked to design a carousel, build exactly this.** Do not re-invent it, do not ask for a
> style direction — reproduce the spec below, then adapt only the card count / copy / width.
> Source of truth: `ZwVfxHE91lALegepRvMOZE` node `125:544`.

- **Type:** local `COMPONENT_SET`, one axis: **`Emphasis = Default | Featured`**
- **Not a DS Fabric component** — built from scratch, every value bound to `[Lib]: FDS Design
Tokens`. Zero unbound colours, zero raw radii, zero hardcoded fonts.

**The three depth planes — this is what makes it read as Flair:**

| Plane                    | Element         | Treatment                            |
| ------------------------ | --------------- | ------------------------------------ |
| Shell (lowest, anchored) | container       | `fds-elevation-const-surface-heavy`  |
| Cards (mid)              | each card       | `fds-elevation-const-surface-medium` |
| Controls (lit)           | Prev/Next pills | `fds-specular-const-gloss`           |

The **shell gets no specular** — specular belongs to the round controls only. Reproduce that
split; it is the single most important thing about this component.

**Structure and exact values (Default variant, 608×300):**

```text
Emphasis=Default                608x300  V  FIXED/HUG
  gap fds-spacing-300 (24) · padding 24 all (fds-spacing-300)
  radius fds-round-const-container-lg (20)
  fill fds-surface · stroke fds-on-surface-ulow 1.5 INSIDE
  fx   fds-elevation-const-surface-heavy
├─ Viewport                     560x188  H  FIXED/HUG  gap 0  pad 0
│  └─ Track                     696x188  H  HUG/HUG
│     gap fds-spacing-200 (16) · padding t/b/l fds-spacing-100 (8), right 0
│     └─ Card  x4               160x172  V  FIXED/HUG  gap 0  pad 0
│        radius container-lg (20) · fill fds-surface-variant
│        stroke fds-on-surface-ulow 1.5 · fx fds-elevation-const-surface-medium
│        ├─ Media               160x104  V  FIXED/FIXED
│        │  radius fds-round-const-container-reg (16)
│        │  fill fds-surface · stroke fds-on-surface-ulow 1.5
│        │  └─ icon 24x24, layoutPositioning ABSOLUTE at (68,40)
│        │     vectors stroke fds-on-surface-m, weight 2
│        └─ Text                V HUG/HUG gap fds-spacing-050 (4) pad fds-spacing-150 (12)
│           ├─ Title            fds-headline-tiny    · fds-on-surface-hi
│           └─ Subtitle         fds-paragraphs-small · fds-on-surface-m
└─ Footer                       560x40   H  SPACE_BETWEEN / CENTER  FIXED/HUG
   ├─ Prev                      40x40    V  CENTER/CENTER
   │  radius fds-round-500 (40) · fill fds-surface-variant
   │  stroke fds-on-surface-ulow 1.5 · fx fds-specular-const-gloss
   │  └─ icon 20x20, vector stroke fds-on-surface-hi weight 2
   ├─ Indicators                H HUG/HUG gap fds-spacing-100 (8)
   │  Dot-Active  8x8 ELLIPSE radius 40 · fds-primary
   │  Dot x3      8x8 ELLIPSE radius 40 · fds-on-surface-ulow
   └─ Next                      identical to Prev, mirrored icon
```

**`Emphasis=Featured` — the ONLY difference is the first card,** renamed `Card-Featured`:

- fill → `GRADIENT_LINEAR #ff8521 → #f25200` (the one deliberate raw gradient)
- **no elevation style.** Instead a raw `DROP_SHADOW` = the emission glow:
  `color fds-fx-specular-emission-primary (#ff6600 @35%)`, offset `(0,0)`, blur `24`, spread `4`
- `Media` fill → `fds-surface-variant`, and its hairline switches to
  **`fds-on-alternate-surface-ulow`** — because it now sits on a saturated surface
- `Title` / `Subtitle` / icon vectors → `fds-on-primary`
- Everything else (size, radii, padding, the other 3 cards, footer) is unchanged

**Rules this component encodes — carry them to any card/carousel work:**

1. **Emphasis is gradient + emission, never a bigger shadow.** A featured card swaps its
   elevation style out for the emission glow; it does not stack both.
2. **`Track` carries 8px padding inside the `Viewport`.** Without it the viewport mask shears the
   cards' shadows off — see `component-gotchas.md`.
3. **Hairline on every surface**, and it switches to `fds-on-alternate-surface-ulow` the moment
   the surface underneath becomes saturated.
4. **Media block is a nested surface**, one radius step down (`container-reg` 16 inside
   `container-lg` 20), with its own hairline and a centered `ABSOLUTE` icon — never a bare rect.
5. Indicator dots are `ELLIPSE` with `cornerRadius: 40` forced; active is `fds-primary`,
   inactive is `fds-on-surface-ulow` (**not** `on-surface-low` — ulow is the correct weight).

**Keys for a one-shot rebuild:**

```text
effect styles  heavy   d57403bdd3e7a89afe7420e5f1019e692577e58c
               medium  91e72e4603ebdcf810465fe6a4a7dd9c34c7eab1
               gloss   320e56c2aba8b0c7579b64919522ad1456f812cc
text styles    headline-tiny    152b6bfadc287e484617763b88feee41d5323922
               paragraphs-small 4d35bd6c9849f972ecf0c62eeb9dde5f9daa579e
colours        surface 305305da0ac691851463ec5c37ab0beaa07607a4
               surface-variant 54eba08b8a4e60c92d9da3dcba9544605a848111
               on-surface-hi dddec7c40cae98edf57c030912e35dd7e767480b
               on-surface-m  79469d1e84d811a100e1ab77bb21f9fa252ffead
               on-surface-ulow cea607449995e9493126ebaa21620699f8adb4c4
               primary 2f614b196ca93577c9dcc151808d254a43307dc4
               on-primary e5fc96baf1385d1a525810991729be3655ec7354
               emission-primary 5af69a2f3538144cf3784a59c01d410b9beded13
radii          container-lg 2c42f3eb9f8406c783d539bfc0c4bfaa682e09ae
               container-reg be1a45c4321ce7dd7522008055416da7ffd04fca
               round-500/pill 5ccb116a64f905ccbfa46e9a9c2270d415c81bf7
spacing        050 a47bc044cac9769a93b7e9255816e726271848ca
               100 562f3c3a19fe072c6b2570bdefd8b2d2a945780d
               150 8f555b6df5b5c6335ed3a87dbf55429e60248a7f
               200 d3f1ebc166faa8875d496f4dacdf9cda547e99df
               300 72e3a82434260d693fdeb4cf768a0bdbb76ead1b
```

`fds-on-alternate-surface-ulow` key (resolved 2026-08-28, `[Lib]: FDS Design Tokens`):
`2245e31685fff5338ec69e231a9b043028d4425e`.

> **Note (2026-08-28):** the original source node `125:544` no longer resolves via
> `get_metadata` (stale/moved — node IDs are volatile). Rebuilt from this recorded spec instead
> of copying the live node; verified against a fresh 2-variant, 5-card build in `Odin-test`
> frame `153:9216` (instances `165:136` Default / `165:197` Featured). All values above still
> matched. **Open issue:** the Featured card's media placeholder icon is bound to
> `fds-on-primary` (white) on a `fds-surface-variant` (white) media background, so the icon is
> effectively invisible until real game art replaces the placeholder — this is per-spec, not a
> build error, but flag it to the designer if a visible placeholder icon is wanted here.

Remember `frame.setExplicitVariableModeForCollection(collection, '24:1')` (Betsson Light) or the
whole Flair layer renders invisible.

- **Status:** `confirmed` — canonical, locked 2026-08-28 at the designer's request.
- **Supersedes** the earlier `Style = Soft | Sharp | Pill` carousel (node `61:540`). That draft is
  retired; do not use it as a reference. Its generic lessons (image-placeholder icon needs
  `ABSOLUTE`, `$fig.variants()` resets hug widths, audit `textStyleId` on every `$fig.text()`)
  now live in `component-gotchas.md`.

---

## Open questions (ask before resolving — do not guess)

- **Button `Context` on an elevated surface.** `FDS-Button-Control-One`/`Two`'s `Context` axis
  (`on-header` / `on-surface-accent` / `on-surface` / `on-alternate-surface` /
  `on-alternate-surface-accent`) — which value is correct for a button placed inside an
  elevated `FDS-Card` vs directly on the page background? Flagged 2026-08-27, unresolved.

---

## Category index (from `list_file_components_for_code_connect`, 623 entries — scan roadmap)

Not yet documented individually — batch these in future sessions, largest first:

`Menu` (106), `user` (47), `FDS-Vertical-Menu-Item` (37), `nav1` (35), `casino` (28),
`FDS-Vertical-Group-Menu-Item` (25), `sb` (21), `Menu-item` (16), `misc` (15),
`fds-skeleton` (14), `Group-Menu-item-title` (13), `live-casino` / `nav2` (11 each),
`sportsbook` (10), `swiper` / `FDS-Responsive-Table` (9 each), `Progress` / `Slider` (8 each),
`Modal` / `FDS-Stepper` (5 each), `List-Cell` (5), `Select` / `header` / `Toggle` (4 each),
`FDS-ProgressBar` / `Active` / `fds-breadcrumb` / `Knob` / `fds-slider` / `FDS-Payment`
(3 each), plus buttons/inputs/cards already covered in earlier sessions (see
`component-gotchas.md`).

**Already documented (see `component-gotchas.md`):** `FDS-Input`, `FDS-Button-Control-One/Two`,
`FDS-Stepper` vs `FDS-Stepper.Step-Group`, `Checkbox Set`, `Notification banner`,
`fds-mini-header`, `FDS-Card`.
