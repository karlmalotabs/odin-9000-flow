/odin-9000

## Frame

<!-- Paste the full Figma URL. Select the COMPONENT_SET root, not a single variant. -->

{url}

## Component

<!-- Name: the tag name for the output (e.g. fds-input-v2, fds-badge, fds-bonus-bar) -->
<!-- Description: one-line — what it is + key interactive feature + notable sub-elements -->
<!-- Element: the native HTML element at its core. This determines interactivity: -->
<!--   "input" → real <input>, focus/blur reactive, emits events, supports type/disabled/readonly -->
<!--   "button" → real <button>, click/keyboard reactive -->
<!--   "div" → presentational only (badge, card, banner) — states driven by props, not user interaction -->
<!--   "select" → real <select> or custom dropdown with keyboard nav -->

- Name: {fds-xxx}
- Description: {e.g. "Text input field with floating label, validation states, and trailing icon controls"}
- Element: {input | button | div | select}

## Pipeline

<!-- Skip: which skills to skip. Usually MODI (unless wireframe → production conversion needed) -->
<!-- Output: StencilJS | Vanilla | Both -->
<!-- Storybook: "All states + interactions" | "Minimal" | "No" -->

- Skip: MODI
- Output: StencilJS
- Storybook: All states + interactions

## Notes (optional)

<!-- Things Figma CAN'T tell ODIN. If you'd Slack this to a dev, put it here. -->
<!-- Leave blank if nothing special — ODIN reads variants, tokens, and layout from Figma. -->

<!-- Behavior / Interaction: -->
<!-- CRITICAL: Tell ODIN which Figma "states" are user-driven (reactive) vs externally set (props): -->
<!-- e.g. "Focus, Filled, Placeholder = reactive (derived from native input focus/blur/value)" -->
<!-- e.g. "Error, Success, Danger = validation props (set by parent/form logic)" -->
<!-- e.g. "Label floats to top-border on focus/filled (absolute positioning)" -->
<!-- e.g. "Disabled state prevents all pointer events" -->
<!-- e.g. "Trailing icon acts as toggle (password reveal)" -->

<!-- Slots (what's external content vs internal structure): -->
<!-- e.g. "Slots: leading-icon, trailing-icon (external). Prefix/Suffix are static labels, not slots." -->

<!-- Scope / Exclusions: -->
<!-- e.g. "Skip elevation variant — not used in production" -->
<!-- e.g. "Only generate surface-variant theme for now" -->

<!-- Token corrections (if you know the design has mistakes): -->
<!-- e.g. "Focus border should be fds-primary, not fds-stroke-const-int-active" -->
