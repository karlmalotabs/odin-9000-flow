/odin-9000

## Frame

<!-- Paste the Figma URL. Can be a COMPONENT_SET, single COMPONENT, or INSTANCE. -->

{url}

## Audit

<!-- What to check — pick one or combine: -->
<!-- "TS + NV" = full audit (Token Studio keys AND Native Variable bindings) -->
<!-- "TS only" = check Token Studio plugin data exists and is correct -->
<!-- "NV only" = check Native Variables are bound to correct props -->
<!-- "Conflicts" = find mismatches between TS and NV on same property -->

- Check: TS + NV
- Action: {Report only | Report + fix bindings}

## Component

<!-- Name: helps ODIN find the right token family (e.g. fds-input, fds-card, fds-badge) -->
<!-- Description: optional one-liner for context -->

- Name: {fds-xxx}
- Description: {e.g. "Main input field component — checking all state variants have correct tokens"}

## Pipeline

- Skip: MODI, VALI, SAGA
- Output: Audit report

## Notes (optional)

<!-- Known issues to verify: -->
<!-- e.g. "Border on read-only should be transparent, not fds-on-surface-ulow" -->
<!-- e.g. "Alternate-surface theme variants may be missing NV fills" -->
<!-- e.g. "Check that padding uses fds-spacing-const-input-v, not generic fds-spacing-200" -->

<!-- Scope: -->
<!-- e.g. "Audit only surface-variant theme" -->
<!-- e.g. "Focus on fills and strokes only — spacing tokens already verified" -->
