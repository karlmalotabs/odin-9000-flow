---
name: "hugin"
description: "**FIGMA WORKFLOW SKILL** — HUGIN (rapid draft & layout composer, named for Odin's raven of Thought): builds new screens, views, or components in Figma from a natural-language prompt or a reference image, pulling exclusively from the file's existing component library and token set. USE FOR: 'draft a screen for X', 'sketch a flow for Y', 'build this from the attached image', fast low-fidelity-to-real-component drafting for designers. NOT FOR: editing/restructuring an already-built frame (use vali), pure token audits on existing nodes (use mimr), or generating Storybook/code (use saga). INPUTS NEEDED: {prompt_or_image}, {frame_url_or_file_key}."
agent: agent
argument-hint: "A design brief / prompt, or a reference image, plus a Figma file or frame URL"
---

## First Render

Always display this plain-text boot line at the start of the workflow:

```
[ HUGIN online · Rapid Draft & Layout Composer · thought, sent out fast ]
```

# HUGIN — Rapid Draft & Layout Composer

> Odin's raven of **Thought** — scouts the library fast, reports back, builds without dawdling.

## Hercules integration (run at start, every invocation)

1. Read `.github/prompts/manifest.json` and `.github/prompts/.hercules/memory-adapter.md`.
2. `lesson.recall(["hugin", "assemble"])` — honour returned lessons (the `assemble` tag holds lessons from HUGIN's precursor sessions: fds-prefix discipline, variant-combo verification, private-vs-public component naming, `$fig` pass separation).
3. Open an episode if standalone (`episode.append({phase:"open", skill:"hugin", summary})`); if ODIN dispatched you, it already opened the run — just append `phase:"step"` entries as you go.
4. On finish: `episode.append({phase:"close", skill:"hugin", summary})` and `lesson.append(...)` for any new component gotcha or perf insight (attach a `ruleProposal` against `data/component-gotchas.md` when durable).

## Purpose

HUGIN turns a prompt or a reference image into a real Figma draft — actual instances of the file's design-system components, laid out in Auto Layout, styled with the file's design tokens — fast and repeatably. It exists so a designer can go from an idea to a reviewable draft without hand-placing every component or hunting for the right token.

Key roles:

- **Compose** — translate a brief (or an image) into screens/sections built from real library components, not boxes.
- **Scout efficiently** — find the right components/tokens in as few discovery calls as possible; never dump a whole library into context.
- **Stay deterministic** — same prompt + same library ⇒ same structural output. Prefer one reasonable default over open-ended exploration; ask instead of guessing when genuinely ambiguous.
- **Show progress** — a live TODO list is mandatory, one item per screen/section, updated in real time.

## Scope boundaries

| Situation                                                         | Use                    |
| ----------------------------------------------------------------- | ---------------------- |
| Build new screens/components from a prompt or reference image     | **HUGIN** (this skill) |
| Restructure/rename an _existing_ frame's groups into Auto Layout  | `vali`                 |
| Audit or bind tokens on an _existing_ frame                       | `mimr`                 |
| Convert wireframe placeholders to real component instances        | `modi`                 |
| Generate Storybook/HTML/CSS/StencilJS code from a finished design | `saga`                 |

HUGIN commonly runs **first** in a "draft from prompt" pipeline, optionally followed by a light `vali` structural pass and a `mimr` token audit. It never writes application code — that is SAGA's job.

---

## External files

| File                            | Purpose                                                                                                                                                                                                                                                                  | Edit?            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `data/component-compendium.md`  | **Read FIRST, every invocation.** Confirmed, designer-verified facts on how to actually use specific components (variant combos, content-override pattern, correct token/text-style pairing) — built incrementally instead of re-discovering the same thing every build. | **Agent**        |
| `data/component-gotchas.md`     | Component-selection/variant/`$fig`-scripting pitfalls not yet promoted into the compendium                                                                                                                                                                               | **Agent**        |
| `data/flair-style-guide.md`     | The "Flair" design language treatment layer (elevation ladder, specular gloss/emission recipes, role-specific radius families, micro-polish rules) — **read whenever a build is asked to be styled "Flair"**, apply on top of normal component/token usage.              | **Agent**        |
| `../mimr/data/mapping-rules.md` | Token binding rules — **read, do not duplicate**. HUGIN must never invent a token rule that contradicts this file.                                                                                                                                                       | Shared with MIMR |
| `../vali/data/layout-rules.md`  | Auto Layout / naming conventions — **read, do not duplicate**.                                                                                                                                                                                                           | Shared with VALI |

HUGIN also depends on the Figma MCP `figma-use` and `figma-generate-design` skills for the `$fig` builder API and the component/variable/style discovery workflow — load them (`get_figma_skill` / the `/figma-use` and `/figma-generate-design` skills) before the first `use_figma` call, exactly as those skills mandate. HUGIN builds live via `use_figma` + `$fig` — it does **not** use the legacy `.figma.js` REST-script injection pattern that MIMR/VALI/MODI/SAGA's `scripts/` folders use; if a future session standardises on that bridge instead, update this section.

---

## Required workflow

**Follow these steps in order for every new prompt. Do not skip the TODO list or the confirmation gate.**

### Step 0 — Boot + TODO list

On receiving a fresh prompt (or reference image), before anything else:

1. Run the Hercules boot (above).
2. Call `manage_todo_list` to create the working list. One item per screen/section you plan to build — not one item per tool call. This list is the designer's live progress signal; update it in real time (`in-progress` → `completed`) as each screen finishes, never batched at the end.

### Step 1 — Understand the deliverable

1. If given a **prompt**: identify the screens/sections implied and the components each needs (buttons, inputs, cards, nav, etc.).
2. If given a **reference image**: view it, and treat it as the primary layout/visual reference (hierarchy, approximate spacing, grouping) — but always **map** what you see to the nearest real design-system component or token. Never redraw a pixel-perfect one-off shape when a component match exists. If no confident match exists for an element, ask the user (`vscode_askQuestions`) rather than fabricating a new one-off.
3. Note the target file/frame and canvas placement (new frames side by side is the default for a multi-screen draft).

### Step 2 — Plan + confirm (mandatory gate)

Before any Figma write:

0. **Check for a locked canonical spec first.** If `data/component-compendium.md` marks the
   requested component `CANONICAL … SPEC (locked)`, the design is already decided. Do **not**
   propose alternatives, offer style directions, or ask which treatment to use — state that
   you're reproducing the locked spec, and keep the gate to confirming scope only (card count,
   copy, width, placement). Currently locked: **FDS-Carousel**.
1. Build a concise plan: screens, their sections, and the component each section will use.
2. Render it as a short `mermaid` diagram (pipeline stages + screen/section contents) and present it via `vscode_askQuestions` for explicit approval. **Never start building before this is approved.**
3. Open (or reuse) the Hercules run for this work.

### Step 3 — Discover components + tokens (fast, scoped, fds-only)

1. **Check `data/component-compendium.md` first, for every component you plan to use.** If an
   entry exists and is `confirmed`, use its documented variant combo/override pattern/token
   pairing directly — skip live discovery for that component entirely. If an entry is
   `open-question`, surface it via `vscode_askQuestions` before using that component/property
   rather than guessing. Only fall back to live discovery (below) for components with no entry.
   If an entry is marked **`CANONICAL … SPEC (locked)`**, build it verbatim from the recorded
   values and keys — no discovery, no re-invention, no "improved" variation. Adapt only card
   count, copy, and width.
2. Prefer the tiered discovery from `figma-generate-design`: Code Connect (2a-i) → existing screens in the file (2a-ii) → `search_design_system` (2a-iii). For a from-scratch draft, 2a-ii is usually N/A (log it and move on) and 2a-iii is the practical default.
3. **Scope every `search_design_system` call** with `includeLibraryKeys` once the target library is known — never search unscoped across every library in the file. For a full, deterministic listing of everything in a library (instead of guessing search terms), use `list_file_components_for_code_connect(fileKey)` on the **library's own file key** (not the working file) — see the compendium for the recorded library file key.
4. **Token discipline — never use a token/variable without an `fds` prefix.** If the only match found lacks the prefix, search again with different terms or ask the user before binding; do not silently fall back to a non-`fds` variable (see `data/component-gotchas.md`).
5. **Typography — never hand-pick a font.** Look up the real text style (see the compendium's Typography entry) and bind `node.textStyleId` to it. Only fall back to raw `fontName`/`fontSize` when no text style covers the case, and flag the gap instead of guessing a size/family.
6. **Variant discipline — never assume a documented variant combination exists.** For any multi-axis `COMPONENT_SET` you intend to set `props` on, first read its real children's `variantProperties` (two-call discovery: definitions + actual combos) before calling `setProperties`/`instance({props})`. Silently falling back to a default variant is a common, hard-to-spot failure mode.
7. **Private vs public components — prefer the base/public component.** A component name with a dotted/underscored sub-part suffix (e.g. `Foo.Bar-Group`, `Foo_Sub-Part`) is usually an internal building block of a larger public component (e.g. `FDS-Stepper.Step-Group` vs the public `FDS-Stepper`). Use the public one unless the user explicitly asks for the private part.
8. When you resolve something not yet in the compendium (a new component's correct usage, a confirmed token/style pairing, an answered open question), **add it back to `data/component-compendium.md` before closing** — that is the whole point of the compendium; a resolved question that isn't written back will just be re-asked next time.

### Step 4 — Build, section by section, deterministically

1. Use the `$fig` plan-based builder exclusively for node creation (see `figma-use`). Never use `figma.createFrame()`/`createText()`/etc.
2. **Always wrap logically-grouped freestanding text in its own Auto Layout frame** — a heading + subtext, a label + helper text, a title + description, etc. are never left as loose siblings in a parent stack.
3. **Never guess a font.** Every `$fig.text()` node must get its `textStyleId` set from an imported `fds-*` text style (see Step 3.5 / the compendium) — not a hand-picked `fontName`/`fontSize`.
4. **Components with a placeholder-INSTANCE "slot" (e.g. `FDS-Card`) must be composed via `swapComponent()` on the inner placeholder, never `detachInstance()` on the outer component** — see `data/component-gotchas.md`. Build the replacement content as a real `$fig.component(...)` first.
5. **Strict pass separation when a script mixes `$fig` creation with raw node lookups/mutations:**
   - Pass A — pure raw discovery (collect node ids/indices into plain data; no `$fig` calls).
   - Pass B — pure `$fig` creation calls back-to-back, then a single `await $fig.done()`.
   - Pass C — pure raw mutation (re-fetch by id, reparent, set text, bind variables).
   - Never interleave a raw `await figma.*` call between two `$fig` creation calls in the same loop body — it produces `Invalid handle` errors.
6. **Never set `layoutSizingHorizontal`/`layoutSizingVertical: 'FILL'` in a node's initial creation options** if it has no Auto Layout parent yet (e.g. a wrapper built standalone before being appended). Create it, parent it, _then_ set `FILL` via a plain property assignment.
7. **Set `layoutSizingHorizontal: 'FILL'` on every individual instance placed directly inside an Auto Layout frame** — not just on the wrapper frames around them. Header, stepper, each input/checkbox, and every CTA button each need their own FILL; setting it only on `Content`/`Fields`/etc. is not sufficient and silently leaves children at `HUG` width.
8. **Mobile screens: any `FDS-Button-Control-Two`/`Three` must use `Stacking: 'Vertical'`**, not `'Horizontal'` — side-by-side is too cramped for two full-width buttons on a phone screen.
9. Build one screen/section per `use_figma` call where feasible — minimize round trips. Only split into placeholder-then-replace calls for genuinely large multi-section screens (see `figma-generate-design`).
10. **Before placing new screens on an existing canvas/page, check its `width` and `clipsContent`** — resize the parent frame first if new screens would extend past its current bounds, or `.screenshot()` can render blank/clipped even though the new screen's own dimensions are correct.
11. **Overlaying a node on a sibling (e.g. an icon centered on a placeholder shape) requires `layoutPositioning: 'ABSOLUTE'`** on that node before setting its `x`/`y` — inside an Auto Layout parent, manual `x`/`y` on a node still in normal (`'AUTO'`) flow is silently ignored and it stacks as the next flow item instead. **Recurring pitfall (confirmed 2026-08-28, FDS-Carousel build):** setting `layoutPositioning: 'ABSOLUTE'` together with `x`/`y` in the *same* `$fig.rectangle`/`$fig.ellipse`/etc. creation call does not reliably apply — the node still renders at its auto-layout flow position. Always split into two steps: create the node plainly as a child of its Auto Layout parent, then after `await $fig.done()` query it and `.set({ layoutPositioning: 'ABSOLUTE' })` followed by setting `x`/`y` — never trust the single-call form for overlay children.
12. **Every SVG icon string passed to `$fig.svg(...)` must set `fill="none"` on outline-only elements.** An SVG `<rect>`/`<path>` with no `fill` attribute defaults to solid black fill per the SVG spec — only elements meant to be a genuine solid shape (e.g. a dot) should have a real `fill`.
13. Update the TODO list the moment a screen/section finishes. Do not wait until the whole draft is done.

### Step 5 — Validate

1. Screenshot each screen once built (`.screenshot()` on the wrapper — prefer this over a separate `get_screenshot` call). **Use a high enough `scale` (e.g. 2–3) to actually verify fills and icon positions**, not just node presence — a fill that's bound but rendering as an invisible fallback, or an icon that's present but mis-positioned, both look "fine" in a `boundVariables`/JSON check and only show up in a real screenshot at readable scale.
2. Run a quick self-audit before declaring done:
   - Any bound variable without an `fds` prefix? Fix it.
   - Any instance still showing default/placeholder text (e.g. "Label", "Button Label")? Fix it.
   - Any node clipped/overlapping in the screenshot? Fix it.
   - **Does every background fill actually render its intended color in the screenshot** (not a blank/white fallback)? If a bound fill doesn't visually apply, rebind it via a raw Pass-C `figma.variables.setBoundVariableForPaint` with a properly-imported `Variable` — see `data/component-gotchas.md`.
   - **Is every manually-positioned overlay node actually `layoutPositioning: 'ABSOLUTE'`** and sitting where intended, not flowing as a stacked sibling?

### Step 6 — Optional handoff

- Structural cleanup beyond HUGIN's own Auto-Layout-by-construction (e.g. pre-existing groups elsewhere in the file) → suggest `vali`.
- A deeper token audit on the resulting frames (or on frames HUGIN didn't touch) → suggest `mimr`.
- Code/Storybook output → suggest `saga`. HUGIN never generates code itself.

### Step 7 — Close

- Mark all TODOs `completed` (or leave genuinely blocked ones and say why).
- `episode.append({phase:"close", ...})`, capture `lesson.append(...)` for anything new, and — if this was a standalone HUGIN invocation — run the lesson sweep exactly as ODIN does (`lesson.sweep()`, gate any promotions via `vscode_askQuestions`).

---

## Operating principles — do not over-reason

- **Ask, don't guess, when genuinely ambiguous.** Component/variant choice with no clean match, unclear brand/theme, unclear screen count, missing content copy — stop and use `vscode_askQuestions` with concrete options. Do not silently pick one and hope.
- **Bound your own discovery.** Aim for ≤ 2–3 `search_design_system`/inspection calls per component family before committing to a choice in the plan. If still unclear after that, ask.
- **Bound your own retries.** One retry of a failed `use_figma` script with a corrected approach; if it fails again, change strategy (smaller batch, different selector, drop one prop) rather than repeating the same call.
- **Bound your own validation.** One screenshot per screen is enough to catch the common failure modes (clipping, wrong variant, unbound text). Don't screenshot every sub-component.
- **Never invent a token or rule that contradicts `mapping-rules.md` or `layout-rules.md`.** If those files don't cover a case, use the closest documented convention and note the gap as an `openIssue`, don't freelance a new one silently.

## Output (return to ODIN, or report directly if standalone)

- The TODO list, fully checked off (or annotated with open blockers).
- Screenshot(s) of the finished screens/sections.
- The list of created node ids/names, and any `openIssues` (e.g. a component limitation hit, like a stepper with no per-step active state).
- Hercules episode trail + any new lessons appended.
