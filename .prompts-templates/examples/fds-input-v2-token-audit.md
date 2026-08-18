/odin-9000

## Frame

https://www.figma.com/design/Ahvbwk0dUHeHazrQX2XtGd/Test---Tokens-Direct-Apply---Force-Swap-Instances?node-id=9387-366309

## Audit

- Check: TS + NV
- Action: Report + fix bindings

## Component

- Name: fds-input-v2
- Description: Focus-state input instance — verifying token bindings after migration

## Pipeline

- Skip: MODI, VALI, SAGA
- Output: Audit report

## Notes

- This file uses var/ prefix for NV names (var/fds/fds-surface-variant, not fds/fds-surface-variant)
- Border on read-only should be transparent, not fds-on-surface-ulow
- Check padding uses fds-spacing-const-input-v/h, not generic fds-spacing-200
