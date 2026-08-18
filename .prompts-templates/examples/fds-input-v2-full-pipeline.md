/odin-9000

## Frame

https://www.figma.com/design/g49emy8hZ4TgmRdNwdLK7R/Flair-%7BFLR-0004%7D-Fds-Input?node-id=48355-5245&t=wLivb6GG8OGdlOB0-4

## Component

- Name: fds-input-v2
- Description: Text input field with floating label, validation states, and trailing icon controls
- Element: input

## Pipeline

- Skip: MODI
- Output: StencilJS
- Storybook: All states + interactions

## Notes

- Focus, Filled, Placeholder = reactive (derived from native input focus/blur/value)
- Error, Success, Danger, Disabled, Read-Only = validation props (set by parent)
- Label floats to top-border on focus/filled (absolute positioning, not layout change)
- Trailing icon acts as password reveal toggle
- Slots: leading-icon, trailing-icon (external). Prefix/Suffix are static labels, not slots.
- Assistive text is a boolean variant with character counter
