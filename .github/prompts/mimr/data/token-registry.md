# Token Registry
<!-- schema-version: 1 -->

> **Source of truth for all FDS design tokens (Betsson node, `ref` subtree excluded).**
> Agent reads this file during Phase 2 to suggest correct token paths.
>
> Columns: `Short Name` | `Token Studio Path` | `Type` | `Native Variable Name` | `Description`
> — `Native Variable Name` is populated only where a Figma native variable is known.

---

## Spacing

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `spacing-xsmall` | `spacing.spacing-xsmall` | `spacing` |  |  |
| `spacing-small` | `spacing.spacing-small` | `spacing` |  |  |
| `spacing-medium` | `spacing.spacing-medium` | `spacing` |  |  |
| `spacing-large` | `spacing.spacing-large` | `spacing` |  |  |
| `spacing-xlarge` | `spacing.spacing-xlarge` | `spacing` |  |  |
| `spacing-custom1` | `spacing.spacing-custom1` | `spacing` |  |  |
| `fds-spacing-050` | `spacing.fds-spacing.fds-spacing-050` | `spacing` |  |  |
| `fds-spacing-100` | `spacing.fds-spacing.fds-spacing-100` | `spacing` |  |  |
| `fds-spacing-150` | `spacing.fds-spacing.fds-spacing-150` | `spacing` |  |  |
| `fds-spacing-200` | `spacing.fds-spacing.fds-spacing-200` | `spacing` |  |  |
| `fds-spacing-250` | `spacing.fds-spacing.fds-spacing-250` | `spacing` |  |  |
| `fds-spacing-300` | `spacing.fds-spacing.fds-spacing-300` | `spacing` |  |  |
| `fds-spacing-400` | `spacing.fds-spacing.fds-spacing-400` | `spacing` |  |  |
| `fds-spacing-500` | `spacing.fds-spacing.fds-spacing-500` | `spacing` |  |  |
| `fds-spacing-600` | `spacing.fds-spacing.fds-spacing-600` | `spacing` |  |  |
| `fds-spacing-const-badge-lg-v` | `spacing.fds-spacing-const.badge.lg.fds-spacing-const-badge-lg-v` | `spacing` |  | High-contrast 'pill' vertical padding for primary status chips; creates a lozenge feel. |
| `fds-spacing-const-badge-lg-h` | `spacing.fds-spacing-const.badge.lg.fds-spacing-const-badge-lg-h` | `spacing` |  | High-contrast 'pill' horizontal padding; ensures text doesn't crowd curved edges. |
| `fds-spacing-const-badge-sm-v` | `spacing.fds-spacing-const.badge.sm.fds-spacing-const-badge-sm-v` | `spacing` |  | Tightest possible vertical inset for inline textual indicators to prevent line-height disruption. |
| `fds-spacing-const-badge-sm-h` | `spacing.fds-spacing-const.badge.sm.fds-spacing-const-badge-sm-h` | `spacing` |  | Minimal horizontal padding for small badges to maintain a compact footprint. |
| `fds-spacing-const-btn-lg-v` | `spacing.fds-spacing-const.btn.lg.fds-spacing-const-btn-lg-v` | `spacing` |  | Optimized vertical padding for high-visibility primary CTAs; prioritizes touch/click hit-area. |
| `fds-spacing-const-btn-lg-h` | `spacing.fds-spacing-const.btn.lg.fds-spacing-const-btn-lg-h` | `spacing` |  | Generous horizontal runway for large buttons to create strong visual emphasis. |
| `fds-spacing-const-btn-reg-v` | `spacing.fds-spacing-const.btn.reg.fds-spacing-const-btn-reg-v` | `spacing` |  | The baseline 'workhorse' vertical density for standard application-wide interactions. |
| `fds-spacing-const-btn-reg-h` | `spacing.fds-spacing-const.btn.reg.fds-spacing-const-btn-reg-h` | `spacing` |  | Standard horizontal padding for regular buttons; provides balanced optical weight. |
| `fds-spacing-const-btn-sm-v` | `spacing.fds-spacing-const.btn.sm.fds-spacing-const-btn-sm-v` | `spacing` |  | Compressed vertical padding for secondary actions or buttons placed within toolbars. |
| `fds-spacing-const-btn-sm-h` | `spacing.fds-spacing-const.btn.sm.fds-spacing-const-btn-sm-h` | `spacing` |  | Reduced horizontal padding for smaller action components in dense UI areas. |
| `fds-spacing-const-btn-tiny-v` | `spacing.fds-spacing-const.btn.tiny.fds-spacing-const-btn-tiny-v` | `spacing` |  | Minimalist vertical padding for micro-UIs or buttons living within tight list items. |
| `fds-spacing-const-btn-tiny-h` | `spacing.fds-spacing-const.btn.tiny.fds-spacing-const-btn-tiny-h` | `spacing` |  | Tight horizontal padding for the smallest button tier to maintain functional proximity. |
| `fds-spacing-const-input-v` | `spacing.fds-spacing-const.input.fds-spacing-const-input-v` | `spacing` |  | Vertical padding for text entry fields; height-matched to btn-reg for layout alignment. |
| `fds-spacing-const-input-h` | `spacing.fds-spacing-const.input.fds-spacing-const-input-h` | `spacing` |  | Horizontal padding for inputs to provide buffer between text and border. |
| `fds-spacing-const-container-canvas-reg` | `spacing.fds-spacing-const.container.fds-spacing-const-container-canvas-reg` | `spacing` |  | The global 'gutter' that prevents content from touching screen edges in standard views. |
| `fds-spacing-const-container-canvas-lg` | `spacing.fds-spacing-const.container.fds-spacing-const-container-canvas-lg` | `spacing` |  | Wider safe-zone/inset for hero sections or expansive wide-screen layouts. |
| `fds-spacing-const-container-card` | `spacing.fds-spacing-const.container.fds-spacing-const-container-card` | `spacing` |  | The internal 'air' or padding required within a card or content container. |
| `fds-spacing-const-gap-v-section` | `spacing.fds-spacing-const.gap.v.fds-spacing-const-gap-v-section` | `spacing` |  | Macro-separation between massive, unrelated page blocks or sections. |
| `fds-spacing-const-gap-v-group` | `spacing.fds-spacing-const.gap.v.fds-spacing-const-gap-v-group` | `spacing` |  | Meso-separation between distinct clusters of components (e.g., fieldset to fieldset). |
| `fds-spacing-const-gap-v-pattern` | `spacing.fds-spacing-const.gap.v.fds-spacing-const-gap-v-pattern` | `spacing` |  | Atomic rhythmic spacing between identical units like sibling Input fields. |
| `fds-spacing-const-gap-h-pattern` | `spacing.fds-spacing-const.gap.h.fds-spacing-const-gap-h-pattern` | `spacing` | `spacing/fds-spacing-const/gap/h/fds-spacing-const-gap-h-pattern` | Horizontal rhythmic distance between sibling components to maintain a predictable grid. |
| `fds-spacing-const-density-compact` | `spacing.fds-spacing-const.density.fds-spacing-const-density-compact` | `spacing` |  | Maximizes data visibility per viewport; minimizes whitespace for power-user views. |
| `fds-spacing-const-density-reg` | `spacing.fds-spacing-const.density.fds-spacing-const-density-reg` | `spacing` |  | Balanced density for standard lists and menus; optimized for general accessibility. |
| `fds-spacing-const-density-wide` | `spacing.fds-spacing-const.density.fds-spacing-const-density-wide` | `spacing` |  | Premium editorial spacing; used to focus attention on high-value individual content pieces. |
| `fds-spacing-const-overlay-popover` | `spacing.fds-spacing-const.overlay.fds-spacing-const-overlay-popover` | `spacing` |  | Internal padding for floating UI elements like Tooltips, Dropdowns, and Menus. |
| `fds-spacing-const-overlay-modal-gutter` | `spacing.fds-spacing-const.overlay.fds-spacing-const-overlay-modal-gutter` | `spacing` |  | Protective safe-margin between a modal's boundary and the viewport edge. |
| `fds-spacing-const-ui-gap` | `spacing.fds-spacing-const.utility.fds-spacing-const-ui-gap` | `spacing` |  | A fixed 8px anchor distance between an icon and its text label across all components. |
| `fds-spacing-const-ui-inset-reg` | `spacing.fds-spacing-const.utility.fds-spacing-const-ui-inset-reg` | `spacing` |  | Square-ratio padding utility for icon-only buttons or avatars to ensure a 1:1 bounding box. |


## Border Radius — Legacy

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `border-radius-xsmall` | `border-radius.border-radius-xsmall` | `borderRadius` |  |  |
| `border-radius-small` | `border-radius.border-radius-small` | `borderRadius` |  |  |
| `border-radius-medium` | `border-radius.border-radius-medium` | `borderRadius` |  |  |
| `border-radius-large` | `border-radius.border-radius-large` | `borderRadius` |  |  |
| `border-radius-xlarge` | `border-radius.border-radius-xlarge` | `borderRadius` |  |  |


## Border Radius — FDS

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-border-radius-btn-default` | `fds-border-radius.fds-border-radius-btn-default` | `borderRadius` |  |  |
| `fds-border-radius-btn-alternate` | `fds-border-radius.fds-border-radius-btn-alternate` | `borderRadius` |  |  |
| `fds-border-radius-container-default` | `fds-border-radius.fds-border-radius-container-default` | `borderRadius` |  |  |
| `fds-border-radius-input-default` | `fds-border-radius.fds-border-radius-input-default` | `borderRadius` |  |  |
| `fds-border-radius-input-alternate` | `fds-border-radius.fds-border-radius-input-alternate` | `borderRadius` |  |  |


## Border Radius — Round Scale

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-round-050` | `fds-round.fds-round-050` | `borderRadius` |  |  |
| `fds-round-100` | `fds-round.fds-round-100` | `borderRadius` |  |  |
| `fds-round-150` | `fds-round.fds-round-150` | `borderRadius` |  |  |
| `fds-round-200` | `fds-round.fds-round-200` | `borderRadius` |  |  |
| `fds-round-250` | `fds-round.fds-round-250` | `borderRadius` |  |  |
| `fds-round-300` | `fds-round.fds-round-300` | `borderRadius` |  |  |
| `fds-round-350` | `fds-round.fds-round-350` | `borderRadius` |  |  |
| `fds-round-400` | `fds-round.fds-round-400` | `borderRadius` |  |  |
| `fds-round-450` | `fds-round.fds-round-450` | `borderRadius` |  |  |
| `fds-round-500` | `fds-round.fds-round-500` | `borderRadius` |  |  |


## Border Radius — Round Constants

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-round-const-btn-sm` | `fds-round-const.ui-controls.btn.fds-round-const-btn-sm` | `borderRadius` |  | Tight radius for compact action hit-areas; maintains professional precision. |
| `fds-round-const-btn-reg` | `fds-round-const.ui-controls.btn.fds-round-const-btn-reg` | `borderRadius` |  | Standard baseline radius for primary interactions; the core of the system. |
| `fds-round-const-btn-lg` | `fds-round-const.ui-controls.btn.fds-round-const-btn-lg` | `borderRadius` |  | Softer radius for high-emphasis hero actions to create a friendly affordance. |
| `fds-round-const-badge-sm` | `fds-round-const.ui-controls.badge.fds-round-const-badge-sm` | `borderRadius` |  | Professional, crisp rounding for inline status indicators. |
| `fds-round-const-badge-lg` | `fds-round-const.ui-controls.badge.fds-round-const-badge-lg` | `borderRadius` |  | Softer rounding for prominent information chips to differentiate from buttons. |
| `fds-round-const-input-reg` | `fds-round-const.ui-controls.input.fds-round-const-input-reg` | `borderRadius` |  | Height-matched to btn-reg for cohesive form rhythm and optical alignment. |
| `fds-round-const-nav-item-sm` | `fds-round-const.ui-controls.nav.fds-round-const-nav-item-sm` | `borderRadius` |  | Efficient rounding for sidebar or dense menu links; optimizes space. |
| `fds-round-const-nav-item-lg` | `fds-round-const.ui-controls.nav.fds-round-const-nav-item-lg` | `borderRadius` |  | Comfortable, touch-friendly rounding for primary tabs and navigation targets. |
| `fds-round-const-nav-indicator` | `fds-round-const.ui-controls.nav.fds-round-const-nav-indicator` | `borderRadius` |  | High-contrast capsule shape for active states to clearly signal selection. |
| `fds-round-const-container-reg` | `fds-round-const.containers.standard.fds-round-const-container-reg` | `borderRadius` |  | Default radius for standard UI containers, Cards, Tables, and Groups. |
| `fds-round-const-container-lg` | `fds-round-const.containers.standard.fds-round-const-container-lg` | `borderRadius` |  | Enhanced radius for wide containers to preserve geometric harmony when nested. |
| `fds-round-const-modal-reg` | `fds-round-const.containers.modal-class.fds-round-const-modal-reg` | `borderRadius` |  | Standard corner logic for Dialogs and Popups to maintain structural consistency. |
| `fds-round-const-modal-lg` | `fds-round-const.containers.modal-class.fds-round-const-modal-lg` | `borderRadius` |  | Max-radius for large surfaces like Drawers and Bottom Sheets to soften presence. |
| `fds-round-const-nav-container-reg` | `fds-round-const.containers.nav-containers.fds-round-const-nav-container-reg` | `borderRadius` |  | Professional rounding for sidebar or header blocks; matches container baseline. |
| `fds-round-const-nav-container-btm` | `fds-round-const.containers.nav-containers.fds-round-const-nav-container-btm` | `borderRadius` |  | Soft, ergonomic rounding for mobile bottom bars to feel integrated with hardware. |
| `fds-round-const-media-thumb-sm` | `fds-round-const.media.fds-round-const-media-thumb-sm` | `borderRadius` | `fds-round-const/media/fds-round-const-media-thumb-sm` | Softened corners for small profile or media assets to appear more organic. |
| `fds-round-const-media-thumb-reg` | `fds-round-const.media.fds-round-const-media-thumb-reg` | `borderRadius` |  | Standard media radius for card-based imagery; balances softness and structure. |
| `fds-round-const-media-thumb-lg` | `fds-round-const.media.fds-round-const-media-thumb-lg` | `borderRadius` | `fds-round-const/media/fds-round-const-media-thumb-lg` | Maximum organic softness for large-scale media assets or hero imagery. |
| `fds-round-const-ui-min` | `fds-round-const.utilities.fds-round-const-ui-min` | `borderRadius` |  | The system floor for rounding (4px); ensures a baseline 'soft' brand feel. |
| `fds-round-const-ui-inner` | `fds-round-const.utilities.fds-round-const-ui-inner` | `borderRadius` |  | Computed radius for elements nested inside a container to ensure concentric curves. |
| `fds-round-const-ui-pill` | `fds-round-const.utilities.fds-round-const-ui-pill` | `borderRadius` |  | Creates perfect pills, capsules, or circles regardless of element dimensions. |
| `fds-round-const-ui-none` | `fds-round-const.utilities.fds-round-const-ui-none` | `borderRadius` |  | Forces absolute sharp corners for edge-to-edge UI or segmented controls. |


## Color — Global Semantic (var.*)

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `header` | `var.header` | `color` |  |  |
| `header-interaction-medium` | `var.header-interaction-medium` | `color` |  |  |
| `header-interaction-high` | `var.header-interaction-high` | `color` |  |  |
| `on-header` | `var.on-header` | `color` |  |  |
| `primary` | `var.primary` | `color` |  |  |
| `primary-interaction-low` | `var.primary-interaction-low` | `color` |  |  |
| `primary-interaction-medium` | `var.primary-interaction-medium` | `color` |  |  |
| `on-primary` | `var.on-primary` | `color` |  |  |
| `secondary` | `var.secondary` | `color` |  |  |
| `secondary-interaction-low` | `var.secondary-interaction-low` | `color` |  |  |
| `secondary-interaction-medium` | `var.secondary-interaction-medium` | `color` |  |  |
| `on-secondary` | `var.on-secondary` | `color` |  |  |
| `tertiary` | `var.tertiary` | `color` |  |  |
| `tertiary-interaction-low` | `var.tertiary-interaction-low` | `color` |  |  |
| `tertiary-interaction-medium` | `var.tertiary-interaction-medium` | `color` |  |  |
| `on-tertiary` | `var.on-tertiary` | `color` |  |  |
| `success` | `var.success` | `color` |  |  |
| `on-success` | `var.on-success` | `color` |  |  |
| `alert` | `var.alert` | `color` |  |  |
| `on-alert` | `var.on-alert` | `color` |  |  |
| `info` | `var.info` | `color` |  |  |
| `on-info` | `var.on-info` | `color` |  |  |
| `error` | `var.error` | `color` |  |  |
| `on-error` | `var.on-error` | `color` |  |  |
| `background` | `var.background` | `color` |  |  |
| `on-background` | `var.on-background` | `color` |  |  |
| `surface` | `var.surface` | `color` |  |  |
| `surface-variant` | `var.surface-variant` | `color` |  |  |
| `on-surface-hi` | `var.on-surface-hi` | `color` |  |  |
| `on-surface-m` | `var.on-surface-m` | `color` |  |  |
| `on-surface-low` | `var.on-surface-low` | `color` |  |  |
| `on-surface-color` | `var.on-surface-color` | `color` |  |  |
| `alternate-surface` | `var.alternate-surface` | `color` |  |  |
| `alternate-surface-variant` | `var.alternate-surface-variant` | `color` |  |  |
| `alternate-surface-nav` | `var.alternate-surface-nav` | `color` |  |  |
| `alternate-overlay` | `var.alternate-overlay` | `color` |  |  |
| `alternate-overlay-variant` | `var.alternate-overlay-variant` | `color` |  |  |
| `on-alternate-surface-hi` | `var.on-alternate-surface-hi` | `color` |  |  |
| `on-alternate-surface-m` | `var.on-alternate-surface-m` | `color` |  |  |
| `on-alternate-surface-low` | `var.on-alternate-surface-low` | `color` |  |  |
| `on-alternate-surface-color` | `var.on-alternate-surface-color` | `color` |  |  |
| `surface-nav` | `var.surface-nav` | `color` |  |  |
| `surface-nav-variant` | `var.surface-nav-variant` | `color` |  |  |
| `on-surface-nav-hi` | `var.on-surface-nav-hi` | `color` |  |  |
| `on-surface-nav-m` | `var.on-surface-nav-m` | `color` |  |  |
| `on-surface-nav-low` | `var.on-surface-nav-low` | `color` |  |  |


## Color — FDS Semantic (var.fds)

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-header` | `var.fds.fds-header` | `color` |  |  |
| `fds-header-interaction-medium` | `var.fds.fds-header-interaction-medium` | `color` |  |  |
| `fds-header-interaction-high` | `var.fds.fds-header-interaction-high` | `color` |  |  |
| `fds-on-header` | `var.fds.fds-on-header` | `color` |  |  |
| `fds-primary` | `var.fds.fds-primary` | `color` |  |  |
| `fds-primary-interaction-low` | `var.fds.fds-primary-interaction-low` | `color` |  |  |
| `fds-primary-interaction-medium` | `var.fds.fds-primary-interaction-medium` | `color` |  |  |
| `fds-on-primary` | `var.fds.fds-on-primary` | `color` |  |  |
| `fds-secondary` | `var.fds.fds-secondary` | `color` |  |  |
| `fds-secondary-interaction-low` | `var.fds.fds-secondary-interaction-low` | `color` |  |  |
| `fds-secondary-interaction-medium` | `var.fds.fds-secondary-interaction-medium` | `color` |  |  |
| `fds-on-secondary` | `var.fds.fds-on-secondary` | `color` |  |  |
| `fds-tertiary` | `var.fds.fds-tertiary` | `color` |  |  |
| `fds-tertiary-interaction-low` | `var.fds.fds-tertiary-interaction-low` | `color` |  |  |
| `fds-tertiary-interaction-medium` | `var.fds.fds-tertiary-interaction-medium` | `color` |  |  |
| `fds-on-tertiary` | `var.fds.fds-on-tertiary` | `color` |  |  |
| `fds-success` | `var.fds.fds-success` | `color` |  |  |
| `fds-success-shade` | `var.fds.fds-success-shade` | `color` |  |  |
| `fds-success-surface` | `var.fds.fds-success-surface` | `color` |  |  |
| `fds-on-success` | `var.fds.fds-on-success` | `color` |  |  |
| `fds-on-success-alternate` | `var.fds.fds-on-success-alternate` | `color` |  | Used on system colours, not on system surface colours, for Badges |
| `fds-alert` | `var.fds.fds-alert` | `color` |  |  |
| `fds-alert-shade` | `var.fds.fds-alert-shade` | `color` |  |  |
| `fds-alert-surface` | `var.fds.fds-alert-surface` | `color` |  |  |
| `fds-on-alert` | `var.fds.fds-on-alert` | `color` |  |  |
| `fds-on-alert-alternate` | `var.fds.fds-on-alert-alternate` | `color` |  | Used on system colours, not on system surface colours, for Badges |
| `fds-info` | `var.fds.fds-info` | `color` |  |  |
| `fds-info-shade` | `var.fds.fds-info-shade` | `color` |  |  |
| `fds-info-surface` | `var.fds.fds-info-surface` | `color` |  |  |
| `fds-on-info` | `var.fds.fds-on-info` | `color` |  |  |
| `fds-on-info-alternate` | `var.fds.fds-on-info-alternate` | `color` |  | Used on system colours, not on system surface colours, for Badges |
| `fds-error` | `var.fds.fds-error` | `color` |  |  |
| `fds-error-shade` | `var.fds.fds-error-shade` | `color` |  |  |
| `fds-error-surface` | `var.fds.fds-error-surface` | `color` |  |  |
| `fds-on-error` | `var.fds.fds-on-error` | `color` |  |  |
| `fds-on-error-alternate` | `var.fds.fds-on-error-alternate` | `color` |  | Used on system colours, not on system surface colours, for Badges |
| `fds-background` | `var.fds.fds-background` | `color` |  |  |
| `fds-on-background` | `var.fds.fds-on-background` | `color` |  |  |
| `fds-surface` | `var.fds.fds-surface` | `color` |  |  |
| `fds-surface-variant` | `var.fds.fds-surface-variant` | `color` |  |  |
| `fds-surface-variant-2` | `var.fds.fds-surface-variant-2` | `color` |  |  |
| `fds-surface-variant-3` | `var.fds.fds-surface-variant-3` | `color` |  |  |
| `fds-overlay` | `var.fds.fds-overlay` | `color` |  | For overlay fills |
| `fds-surface-accent` | `var.fds.fds-surface-accent` | `color` |  |  |
| `fds-on-surface-hi` | `var.fds.fds-on-surface-hi` | `color` |  |  |
| `fds-on-surface-m` | `var.fds.fds-on-surface-m` | `color` |  |  |
| `fds-on-surface-low` | `var.fds.fds-on-surface-low` | `color` |  |  |
| `fds-on-surface-ulow` | `var.fds.fds-on-surface-ulow` | `color` |  |  |
| `fds-on-surface-color` | `var.fds.fds-on-surface-color` | `color` |  |  |
| `fds-alternate-surface` | `var.fds.fds-alternate-surface` | `color` |  |  |
| `fds-alternate-surface-variant` | `var.fds.fds-alternate-surface-variant` | `color` |  |  |
| `fds-alternate-surface-variant-2` | `var.fds.fds-alternate-surface-variant-2` | `color` |  |  |
| `fds-alternate-surface-variant-3` | `var.fds.fds-alternate-surface-variant-3` | `color` |  |  |
| `fds-alternate-surface-nav` | `var.fds.fds-alternate-surface-nav` | `color` |  |  |
| `fds-alternate-overlay` | `var.fds.fds-alternate-overlay` | `color` |  |  |
| `fds-alternate-overlay-variant` | `var.fds.fds-alternate-overlay-variant` | `color` |  |  |
| `fds-on-alternate-surface-hi` | `var.fds.fds-on-alternate-surface-hi` | `color` |  |  |
| `fds-on-alternate-surface-m` | `var.fds.fds-on-alternate-surface-m` | `color` |  |  |
| `fds-on-alternate-surface-low` | `var.fds.fds-on-alternate-surface-low` | `color` |  |  |
| `fds-on-alternate-surface-ulow` | `var.fds.fds-on-alternate-surface-ulow` | `color` |  |  |
| `fds-on-alternate-surface-color` | `var.fds.fds-on-alternate-surface-color` | `color` |  |  |
| `fds-on-alternate-surface-nav-color` | `var.fds.fds-on-alternate-surface-nav-color` | `color` |  |  |
| `fds-surface-nav` | `var.fds.fds-surface-nav` | `color` |  |  |
| `fds-surface-nav-shade` | `var.fds.fds-surface-nav-shade` | `color` |  |  |
| `fds-surface-nav-variant` | `var.fds.fds-surface-nav-variant` | `color` |  |  |
| `fds-surface-nav-active` | `var.fds.fds-surface-nav-active` | `color` |  |  |
| `fds-on-surface-nav-hi` | `var.fds.fds-on-surface-nav-hi` | `color` |  |  |
| `fds-on-surface-nav-m` | `var.fds.fds-on-surface-nav-m` | `color` |  |  |
| `fds-on-surface-nav-low` | `var.fds.fds-on-surface-nav-low` | `color` |  |  |
| `fds-on-surface-nav-color` | `var.fds.fds-on-surface-nav-color` | `color` |  |  |
| `fds-alternate-surface-nav-active` | `var.fds.fds-alternate-surface-nav-active` | `color` |  |  |


## Color — Button (var.btn)

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-btn-accent` | `var.btn.fds-btn-accent` | `color` |  |  |
| `fds-btn-accent-shade` | `var.btn.fds-btn-accent-shade` | `color` |  |  |
| `fds-btn-accent-hover` | `var.btn.fds-btn-accent-hover` | `color` |  |  |
| `fds-btn-accent-active` | `var.btn.fds-btn-accent-active` | `color` |  |  |
| `fds-on-btn-accent` | `var.btn.fds-on-btn-accent` | `color` |  |  |
| `fds-btn-default` | `var.btn.fds-btn-default` | `color` |  |  |
| `fds-btn-default-shade` | `var.btn.fds-btn-default-shade` | `color` |  |  |
| `fds-btn-default-hover` | `var.btn.fds-btn-default-hover` | `color` |  |  |
| `fds-btn-default-active` | `var.btn.fds-btn-default-active` | `color` |  |  |
| `fds-on-btn-default` | `var.btn.fds-on-btn-default` | `color` |  |  |
| `fds-btn-alternate-accent` | `var.btn.fds-btn-alternate-accent` | `color` |  |  |
| `fds-btn-alternate-accent-copy` | `var.btn.fds-btn-alternate-accent-copy` | `color` |  |  |
| `fds-btn-alternate-accent-hover` | `var.btn.fds-btn-alternate-accent-hover` | `color` |  |  |
| `fds-btn-alternate-accent-active` | `var.btn.fds-btn-alternate-accent-active` | `color` |  |  |
| `fds-on-btn-alternate-accent` | `var.btn.fds-on-btn-alternate-accent` | `color` |  |  |
| `fds-btn-on-surface-hover` | `var.btn.fds-btn-on-surface-hover` | `color` |  |  |
| `fds-btn-on-surface-active` | `var.btn.fds-btn-on-surface-active` | `color` |  |  |
| `fds-btn-on-alternate-surface-hover` | `var.btn.fds-btn-on-alternate-surface-hover` | `color` |  |  |
| `fds-btn-on-alternate-surface-active` | `var.btn.fds-btn-on-alternate-surface-active` | `color` |  |  |
| `fds-btn-on-alternate-surface-default` | `var.btn.fds-btn-on-alternate-surface-default` | `color` |  |  |
| `fds-btn-on-header-default` | `var.btn.fds-btn-on-header-default` | `color` |  |  |
| `fds-btn-on-surface-default` | `var.btn.fds-btn-on-surface-default` | `color` |  |  |


## Color — Gaming

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-gaming-ribbon-exclusive` | `gaming.fds-gaming-ribbon-exclusive` | `color` |  |  |
| `fds-on-gaming-ribbon-exclusive` | `gaming.fds-on-gaming-ribbon-exclusive` | `color` |  |  |
| `fds-gaming-ribbon-new` | `gaming.fds-gaming-ribbon-new` | `color` |  |  |
| `fds-on-gaming-ribbon-new` | `gaming.fds-on-gaming-ribbon-new` | `color` |  |  |
| `fds-gaming-ribbon-hot` | `gaming.fds-gaming-ribbon-hot` | `color` |  |  |
| `fds-on-gaming-ribbon-hot` | `gaming.fds-on-gaming-ribbon-hot` | `color` |  |  |
| `fds-gaming-ribbon-default` | `gaming.fds-gaming-ribbon-default` | `color` |  |  |
| `fds-on-gaming-ribbon-default` | `gaming.fds-on-gaming-ribbon-default` | `color` |  |  |
| `fds-gaming-thumbnail-hover` | `gaming.fds-gaming-thumbnail-hover` | `color` |  | Should be radial and not linear |
| `fds-on-gaming-thumbnail-hover` | `gaming.fds-on-gaming-thumbnail-hover` | `color` |  |  |
| `fds-gaming-thumbnail-display` | `gaming.fds-gaming-thumbnail-display` | `color` |  |  |
| `fds-on-gaming-thumbnail-display` | `gaming.fds-on-gaming-thumbnail-display` | `color` |  |  |
| `fds-gaming-thumbnail-alt-display` | `gaming.fds-gaming-thumbnail-alt-display` | `color` |  |  |
| `fds-on-gaming-thumbnail-alt-display` | `gaming.fds-on-gaming-thumbnail-alt-display` | `color` |  |  |
| `fds-gaming-live-black` | `gaming.live.fds-gaming-live-black` | `color` |  |  |
| `fds-gaming-live-gray` | `gaming.live.fds-gaming-live-gray` | `color` |  |  |
| `fds-gaming-live-red` | `gaming.live.fds-gaming-live-red` | `color` |  |  |
| `fds-gaming-live-green` | `gaming.live.fds-gaming-live-green` | `color` |  |  |
| `fds-gaming-live-blue` | `gaming.live.fds-gaming-live-blue` | `color` |  |  |
| `fds-gaming-live-yellow` | `gaming.live.fds-gaming-live-yellow` | `color` |  |  |
| `fds-gaming-live-white` | `gaming.live.fds-gaming-live-white` | `color` |  |  |


## Color — Sportsbook

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-sb-backdrop` | `sportsbook.surface.fds-sb-backdrop` | `color` |  | For overlay fills |
| `fds-sb-cashout-surface` | `sportsbook.surface.fds-sb-cashout-surface` | `color` |  |  |
| `fds-sb-on-cashout-surface` | `sportsbook.surface.fds-sb-on-cashout-surface` | `color` |  |  |
| `fds-sb-btn-cashout` | `sportsbook.btn.fds-sb-btn-cashout` | `color` |  |  |
| `fds-sb-btn-cashout-hover` | `sportsbook.btn.fds-sb-btn-cashout-hover` | `color` |  |  |
| `fds-sb-btn-cashout-active` | `sportsbook.btn.fds-sb-btn-cashout-active` | `color` |  |  |
| `fds-sb-on-btn-cashout` | `sportsbook.btn.fds-sb-on-btn-cashout` | `color` |  |  |
| `fds-sb-btn-odds` | `sportsbook.btn.fds-sb-btn-odds` | `color` |  |  |
| `fds-sb-btn-odds-hover` | `sportsbook.btn.fds-sb-btn-odds-hover` | `color` |  |  |
| `fds-sb-on-btn-odds` | `sportsbook.btn.fds-sb-on-btn-odds` | `color` |  |  |
| `fds-sb-on-btn-odds-m` | `sportsbook.btn.fds-sb-on-btn-odds-m` | `color` |  |  |
| `fds-sb-btn-odds-active` | `sportsbook.btn.fds-sb-btn-odds-active` | `color` |  |  |
| `fds-sb-btn-odds-active-hover` | `sportsbook.btn.fds-sb-btn-odds-active-hover` | `color` |  |  |
| `fds-sb-on-btn-odds-active` | `sportsbook.btn.fds-sb-on-btn-odds-active` | `color` |  |  |
| `fds-sb-cashout` | `sportsbook.product.fds-sb-cashout` | `color` |  | --fds-sb-product-accas |
| `fds-sb-on-cashout` | `sportsbook.product.fds-sb-on-cashout` | `color` |  | --fds-sb-on-product-accas |
| `fds-sb-accas` | `sportsbook.product.fds-sb-accas` | `color` |  | --fds-sb-product-accas |
| `fds-sb-on-accas` | `sportsbook.product.fds-sb-on-accas` | `color` |  | --fds-sb-on-product-accas |
| `fds-sb-bet-builder` | `sportsbook.product.fds-sb-bet-builder` | `color` |  | --fds-sb-product-bet-builder |
| `fds-sb-on-betbuilder` | `sportsbook.product.fds-sb-on-betbuilder` | `color` |  | --fds-sb-on-product-betbuilder |
| `fds-sb-boost` | `sportsbook.product.fds-sb-boost` | `color` |  | --fds-sb-product-boost |
| `fds-sb-on-boost` | `sportsbook.product.fds-sb-on-boost` | `color` |  | --fds-sb-on-product-boost |
| `fds-sb-current-score` | `sportsbook.product.fds-sb-current-score` | `color` |  | --fds-sb-product-current-score |
| `fds-sb-event-countdown` | `sportsbook.product.fds-sb-event-countdown` | `color` |  | --fds-sb-product-event-countdown |
| `fds-sb-event-Info` | `sportsbook.product.fds-sb-event-Info` | `color` |  | --fds-sb-product-event-info  **This used for streaming icon and theorically, Live icon.** |
| `fds-sb-event-status` | `sportsbook.product.fds-sb-event-status` | `color` |  | --fds-sb-product-event-status |
| `fds-sb-odds-up` | `sportsbook.product.fds-sb-odds-up` | `color` |  | --fds-sb-product-odds-up |
| `fds-sb-odds-down` | `sportsbook.product.fds-sb-odds-down` | `color` |  | --fds-sb-product-odds-down |
| `fds-sb-state-open` | `sportsbook.state.fds-sb-state-open` | `color` |  |  |
| `fds-sb-on-state-open` | `sportsbook.state.fds-sb-on-state-open` | `color` |  |  |
| `fds-sb-state-won` | `sportsbook.state.fds-sb-state-won` | `color` |  |  |
| `fds-sb-on-state-win` | `sportsbook.state.fds-sb-on-state-win` | `color` |  |  |
| `fds-sb-state-lost` | `sportsbook.state.fds-sb-state-lost` | `color` |  |  |
| `fds-sb-on-state-lost` | `sportsbook.state.fds-sb-on-state-lost` | `color` |  |  |
| `fds-sb-state-void` | `sportsbook.state.fds-sb-state-void` | `color` |  |  |
| `fds-sb-on-state-void` | `sportsbook.state.fds-sb-on-state-void` | `color` |  |  |
| `fds-sb-state-default` | `sportsbook.state.fds-sb-state-default` | `color` |  |  |
| `fds-sb-on-state-default` | `sportsbook.state.fds-sb-on-state-default` | `color` |  |  |
| `fds-sb-state-single` | `sportsbook.state.fds-sb-state-single` | `color` |  |  |
| `fds-sb-on-state-single` | `sportsbook.state.fds-sb-on-state-single` | `color` |  |  |
| `fds-sb-state-combi` | `sportsbook.state.fds-sb-state-combi` | `color` |  |  |
| `fds-sb-on-state-combi` | `sportsbook.state.fds-sb-on-state-combi` | `color` |  |  |
| `fds-sb-state-loading` | `sportsbook.state.fds-sb-state-loading` | `color` |  |  |
| `fds-sb-card-overlay` | `sportsbook.card.fds-sb-card-overlay` | `color` |  |  |
| `fds-sb-on-card-full` | `sportsbook.card.fds-sb-on-card-full` | `color` |  | --fds-sb-on-overlay-text-full |
| `fds-sb-on-card-md` | `sportsbook.card.fds-sb-on-card-md` | `color` |  | --fds-sb-on-overlay-text-md |
| `fds-sb-on-card-active-dots` | `sportsbook.card.fds-sb-on-card-active-dots` | `color` |  | --fds-sb-on-overlay-active-dots |
| `fds-sb-positive` | `sportsbook.stats.fds-sb-positive` | `color` |  | --fds-sb-color-trend-positive |
| `fds-sb-on-positive` | `sportsbook.stats.fds-sb-on-positive` | `color` |  | --fds-sb-on-trend-positive |
| `fds-sb-negative` | `sportsbook.stats.fds-sb-negative` | `color` |  | --sfd-sb-color-trend-negative |
| `fds-sb-on-negative` | `sportsbook.stats.fds-sb-on-negative` | `color` |  | --fds-sb-on-trend-negative |
| `fds-sb-neutral` | `sportsbook.stats.fds-sb-neutral` | `color` |  | --fds-sb-color-trend-neutral |
| `fds-sb-on-neutral` | `sportsbook.stats.fds-sb-on-neutral` | `color` |  | --fds-sb-on-trend-neutral |
| `fds-sb-disabled` | `sportsbook.fds-sb-disabled` | `opacity` |  | This token will be applied in the component opacity. It's not used to change the opacity of background or surfaces in the sportsbook. |


## Border / Stroke — Scale

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-stroke-050` | `fds-stroke.fds-stroke-050` | `borderWidth` |  |  |
| `fds-stroke-100` | `fds-stroke.fds-stroke-100` | `borderWidth` |  |  |
| `fds-stroke-150` | `fds-stroke.fds-stroke-150` | `borderWidth` |  |  |
| `fds-stroke-200` | `fds-stroke.fds-stroke-200` | `borderWidth` |  |  |


## Border / Stroke — Constants

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-border-btn-secondary` | `fds-border-btn-secondary` | `borderWidth` |  | Ghost buttons |
| `border-100` | `border-100` | `border` |  |  |
| `fds-stroke-const-ui-s-on-surface` | `fds-stroke-const.ui.fds-stroke-const-ui-s-on-surface` | `border` |  | Subtle hairline border for light containment on primary surfaces; minimizes visual noise. |
| `fds-stroke-const-ui-reg-on-surface` | `fds-stroke-const.ui.fds-stroke-const-ui-reg-on-surface` | `border` |  | Standard baseline border for cards and sections on primary surfaces. |
| `fds-stroke-const-ui-s-on-alternate-surface` | `fds-stroke-const.ui.fds-stroke-const-ui-s-on-alternate-surface` | `border` |  | Subtle border with optical correction (increased width) for visibility on alternate/lower-contrast surfaces. |
| `fds-stroke-const-ui-reg-on-alternate-surface` | `fds-stroke-const.ui.fds-stroke-const-ui-reg-on-alternate-surface` | `border` |  | Standard baseline border for containers sitting on alternate-surface backgrounds. |
| `fds-stroke-const-int-rest` | `fds-stroke-const.interactive.fds-stroke-const-int-rest` | `border` |  | Neutral state boundary for interactive elements (Inputs, Selects, Cards) in their inactive/rest state. |
| `fds-stroke-const-int-active` | `fds-stroke-const.interactive.fds-stroke-const-int-active` | `border` |  | Focus/Active state; utilizes increased width and brand primary color for clear accessibility feedback. |
| `fds-stroke-const-int-error` | `fds-stroke-const.interactive.fds-stroke-const-int-error` | `border` |  | Critical validation state; signals error or required attention via width and system error color. |
| `fds-stroke-const-int-success` | `fds-stroke-const.interactive.fds-stroke-const-int-success` | `border` |  | Positive validation state; signals successful completion or valid input. |
| `fds-stroke-const-int-disabled` | `fds-stroke-const.interactive.fds-stroke-const-int-disabled` | `border` |  | Inert state boundary; uses ultra-low contrast to signal non-interactive status. |
| `fds-stroke-const-ghost-on-surface` | `fds-stroke-const.ghost.fds-stroke-const-ghost-on-surface` | `border` |  | Primary brand outline for secondary actions/ghost buttons on standard surfaces. |
| `fds-stroke-const-ghost-on-alternate-surface` | `fds-stroke-const.ghost.fds-stroke-const-ghost-on-alternate-surface` | `border` |  | High-contrast outline for ghost actions on dark or alternate-surface backgrounds. |
| `fds-stroke-const-ghost-on-surface-color` | `fds-stroke-const.ghost.fds-stroke-const-ghost-on-surface-color` | `border` |  | Inverted/Contrast-safe outline for actions sitting on primary colored surfaces. |
| `fds-stroke-const-divider-reg` | `fds-stroke-const.layout.fds-stroke-const-divider-reg` | `border` |  | Subtle hairline separator for internal lists or repeating rhythmic content units. |
| `fds-stroke-const-divider-heavy` | `fds-stroke-const.layout.fds-stroke-const-divider-heavy` | `border` |  | Stronger separator used to define distinct logical content groups or major sections. |
| `fds-stroke-const-ui-transparent` | `fds-stroke-const.utility.fds-stroke-const-ui-transparent` | `border` |  | Transparent placeholder border to prevent layout 'jumping' during hover/state transitions. |
| `fds-stroke-const-ui-focus-ring` | `fds-stroke-const.utility.fds-stroke-const-ui-focus-ring` | `border` |  | Dedicated accessibility ring for keyboard navigation; ensures WCAG compliance. |


## Elevation — Legacy

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `elevation1` | `elevation1` | `boxShadow` |  |  |
| `elevation2` | `elevation2` | `boxShadow` |  |  |
| `elevation3` | `elevation3` | `boxShadow` |  |  |
| `boxshadow1` | `boxshadow1` | `boxShadow` |  |  |
| `boxshadow2` | `boxshadow2` | `boxShadow` |  |  |
| `boxshadow3` | `boxshadow3` | `boxShadow` |  |  |


## Elevation — Semantic Surfaces

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-elevation-on-surface-01` | `fds-elevation-on-surface-01` | `boxShadow` |  |  |
| `fds-elevation-on-surface-02` | `fds-elevation-on-surface-02` | `boxShadow` |  |  |
| `fds-elevation-on-surface-03` | `fds-elevation-on-surface-03` | `boxShadow` |  |  |
| `fds-elevation-on-alternate-surface-01` | `fds-elevation-on-alternate-surface-01` | `boxShadow` |  |  |
| `fds-elevation-on-alternate-surface-02` | `fds-elevation-on-alternate-surface-02` | `boxShadow` |  |  |
| `fds-elevation-on-alternate-surface-03` | `fds-elevation-on-alternate-surface-03` | `boxShadow` |  |  |


## Elevation — Constants

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-elevation-const-surface-heavy` | `fds-elevation-const.on-surface.fds-elevation-const-surface-heavy` | `boxShadow` |  | High-density elevation for elements sitting low on the canvas; tight, single-layer anchor shadow. |
| `fds-elevation-const-surface-medium` | `fds-elevation-const.on-surface.fds-elevation-const-surface-medium` | `boxShadow` |  | 2-layer balanced depth for standard cards and sections; utilizes a penumbra/umbra stack for natural diffusion. |
| `fds-elevation-const-surface-light` | `fds-elevation-const.on-surface.fds-elevation-const-surface-light` | `boxShadow` |  | Low-density, high-float elevation for modals and popovers; uses negative spread to prevent muddy edges. |
| `fds-elevation-const-alternate-surface-heavy` | `fds-elevation-const.on-alternate-surface.fds-elevation-const-alternate-surface-heavy` | `boxShadow` |  | Optical correction for dark surfaces; increased alpha to maintain visibility of dense objects. |
| `fds-elevation-const-alternate-surface-medium` | `fds-elevation-const.on-alternate-surface.fds-elevation-const-alternate-surface-medium` | `boxShadow` |  | Deep 2-layer shadow for high separation on alternate/dark surfaces. |
| `fds-elevation-const-alternate-surface-light` | `fds-elevation-const.on-alternate-surface.fds-elevation-const-alternate-surface-light` | `boxShadow` |  | Maximum separation for overlays on dark backgrounds; ensures UI hierarchy remains perceptible. |


## Specular — Constants

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-specular-const-gloss-on-surface` | `fds-specular-const.gloss.fds-specular-const-gloss-on-surface` | `boxShadow` |  | Subtle 40% white specular catch for light surfaces; adds tactile bevel without over-exposure. |
| `fds-specular-const-gloss-on-alternate-surface` | `fds-specular-const.gloss.fds-specular-const-gloss-on-alternate-surface` | `boxShadow` |  | High-contrast 100% white specular glint for dark surfaces; mimics physical light reflection. |
| `fds-specular-const-gloss-on-surface-color` | `fds-specular-const.gloss.fds-specular-const-gloss-on-surface-color` | `boxShadow` |  | Vibrant 80% white specular for brand-colored surfaces; enhances chroma and depth. |
| `fds-specular-const-matte-on-system` | `fds-specular-const.matte.fds-specular-const-matte-on-system` | `boxShadow` |  | Low-profile internal bevel for system elements; provides structural depth without high-gloss. |
| `fds-specular-const-emission-primary` | `fds-specular-const.emission.brand.fds-specular-const-emission-primary` | `boxShadow` |  | Faint ambient outer glow using the primary brand colour — reinforces brand identity on elevated or featured elements. |
| `fds-specular-const-emission-secondary` | `fds-specular-const.emission.brand.fds-specular-const-emission-secondary` | `boxShadow` |  | Faint ambient outer glow using the secondary brand colour — used for accent or complementary brand moments. |
| `fds-specular-const-emission-success` | `fds-specular-const.emission.system.fds-specular-const-emission-success` | `boxShadow` |  | Faint ambient outer glow for success system state — reinforces positive feedback on indicators or badges. |
| `fds-specular-const-emission-alert` | `fds-specular-const.emission.system.fds-specular-const-emission-alert` | `boxShadow` |  | Faint ambient outer glow for alert system state — draws attention to warning-level elements. |
| `fds-specular-const-emission-error` | `fds-specular-const.emission.system.fds-specular-const-emission-error` | `boxShadow` |  | Faint ambient outer glow for error system state — signals critical validation or failure states. |
| `fds-specular-const-emission-info` | `fds-specular-const.emission.system.fds-specular-const-emission-info` | `boxShadow` |  | Faint ambient outer glow for info system state — subtly highlights informational elements. |


## Typography — Primitives

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `0` | `lineHeights.0` | `lineHeights` |  |  |
| `1` | `lineHeights.1` | `lineHeights` |  |  |
| `2` | `lineHeights.2` | `lineHeights` |  |  |
| `3` | `lineHeights.3` | `lineHeights` |  |  |
| `4` | `lineHeights.4` | `lineHeights` |  |  |
| `5` | `lineHeights.5` | `lineHeights` |  |  |
| `6` | `lineHeights.6` | `lineHeights` |  |  |
| `7` | `lineHeights.7` | `lineHeights` |  |  |
| `8` | `lineHeights.8` | `lineHeights` |  |  |
| `9` | `lineHeights.9` | `lineHeights` |  |  |
| `12` | `lineHeights.12` | `lineHeights` |  |  |
| `14` | `lineHeights.14` | `lineHeights` |  |  |
| `01` | `lineHeights.01` | `lineHeights` |  |  |
| `010` | `lineHeights.010` | `lineHeights` |  |  |
| `8` | `fontSize.8` | `fontSizes` |  |  |
| `10` | `fontSize.10` | `fontSizes` |  |  |
| `12` | `fontSize.12` | `fontSizes` |  |  |
| `14` | `fontSize.14` | `fontSizes` |  |  |
| `16` | `fontSize.16` | `fontSizes` |  |  |
| `18` | `fontSize.18` | `fontSizes` |  |  |
| `20` | `fontSize.20` | `fontSizes` |  |  |
| `24` | `fontSize.24` | `fontSizes` |  |  |
| `30` | `fontSize.30` | `fontSizes` |  |  |
| `32` | `fontSize.32` | `fontSizes` |  |  |
| `36` | `fontSize.36` | `fontSizes` |  |  |
| `40` | `fontSize.40` | `fontSizes` |  |  |
| `48` | `fontSize.48` | `fontSizes` |  |  |
| `56` | `fontSize.56` | `fontSizes` |  |  |
| `0` | `letterSpacing.0` | `letterSpacing` |  |  |
| `1` | `letterSpacing.1` | `letterSpacing` |  |  |
| `2` | `letterSpacing.2` | `letterSpacing` |  |  |
| `3` | `letterSpacing.3` | `letterSpacing` |  |  |
| `4` | `letterSpacing.4` | `letterSpacing` |  |  |
| `5` | `letterSpacing.5` | `letterSpacing` |  |  |
| `6` | `letterSpacing.6` | `letterSpacing` |  |  |
| `7` | `letterSpacing.7` | `letterSpacing` |  |  |
| `8` | `letterSpacing.8` | `letterSpacing` |  |  |
| `9` | `letterSpacing.9` | `letterSpacing` |  |  |
| `10` | `letterSpacing.10` | `letterSpacing` |  |  |
| `11` | `letterSpacing.11` | `letterSpacing` |  |  |
| `12` | `letterSpacing.12` | `letterSpacing` |  |  |
| `0` | `paragraphSpacing.0` | `paragraphSpacing` |  |  |
| `none` | `textCase.none` | `textCase` |  |  |
| `none` | `textDecoration.none` | `textDecoration` |  |  |
| `primary-font` | `fontFamilies.primary-font` | `fontFamilies` |  |  |
| `secondary-font` | `fontFamilies.secondary-font` | `fontFamilies` |  |  |
| `gaming-font` | `fontFamilies.gaming-font` | `fontFamilies` |  |  |
| `sportsbook-font` | `fontFamilies.sportsbook-font` | `fontFamilies` |  | This font family is used for font category defined as "Decoration". Betsson Sans is used only for Betsson. The other brands will use Poppins |
| `weight-0` | `fontWeights.weight-0` | `fontWeights` |  |  |
| `weight-1` | `fontWeights.weight-1` | `fontWeights` |  |  |
| `weight-2` | `fontWeights.weight-2` | `fontWeights` |  |  |
| `sportsbook-weight` | `fontWeights.sportsbook-weight` | `fontWeights` |  | Used in Sportsbook for minigames not related to traditional markets (aka Decoration typography) |


## Typography — Composite (FDS)

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `Lead` | `Display.Lead` | `typography` |  |  |
| `Regular` | `Display.Regular` | `typography` |  |  |
| `Small` | `Display.Small` | `typography` |  |  |
| `Tiny` | `Display.Tiny` | `typography` |  |  |
| `fds-display-lead` | `Display.fds.fds-display-lead` | `typography` |  |  |
| `fds-display-regular` | `Display.fds.fds-display-regular` | `typography` |  |  |
| `fds-display-small` | `Display.fds.fds-display-small` | `typography` |  |  |
| `fds-display-tiny` | `Display.fds.fds-display-tiny` | `typography` |  |  |
| `Lead` | `Headline.Lead` | `typography` |  |  |
| `Regular` | `Headline.Regular` | `typography` |  |  |
| `Small` | `Headline.Small` | `typography` |  |  |
| `Tiny` | `Headline.Tiny` | `typography` |  |  |
| `fds-headline-lead` | `Headline.fds.fds-headline-lead` | `typography` |  |  |
| `fds-headline-regular` | `Headline.fds.fds-headline-regular` | `typography` |  |  |
| `fds-headline-small` | `Headline.fds.fds-headline-small` | `typography` |  |  |
| `fds-headline-tiny` | `Headline.fds.fds-headline-tiny` | `typography` |  |  |
| `Lead` | `Paragraphs.Lead` | `typography` |  |  |
| `Lead - bold` | `Paragraphs.Lead - bold` | `typography` |  |  |
| `Regular` | `Paragraphs.Regular` | `typography` |  |  |
| `Regular - bold` | `Paragraphs.Regular - bold` | `typography` |  |  |
| `Small` | `Paragraphs.Small` | `typography` |  |  |
| `Small - bold` | `Paragraphs.Small - bold` | `typography` |  |  |
| `Tiny` | `Paragraphs.Tiny` | `typography` |  |  |
| `Tiny - bold` | `Paragraphs.Tiny - bold` | `typography` |  |  |
| `fds-paragraphs-lead` | `Paragraphs.fds.fds-paragraphs-lead` | `typography` |  |  |
| `fds-paragraphs-lead-bold` | `Paragraphs.fds.fds-paragraphs-lead-bold` | `typography` |  |  |
| `fds-paragraphs-regular` | `Paragraphs.fds.fds-paragraphs-regular` | `typography` |  |  |
| `fds-paragraphs-regular-bold` | `Paragraphs.fds.fds-paragraphs-regular-bold` | `typography` |  |  |
| `fds-paragraphs-small` | `Paragraphs.fds.fds-paragraphs-small` | `typography` |  |  |
| `fds-paragraphs-small-bold` | `Paragraphs.fds.fds-paragraphs-small-bold` | `typography` |  |  |
| `fds-paragraphs-tiny` | `Paragraphs.fds.fds-paragraphs-tiny` | `typography` |  |  |
| `fds-paragraphs-tiny-bold` | `Paragraphs.fds.fds-paragraphs-tiny-bold` | `typography` |  |  |
| `fds-paragraphs-micro` | `Paragraphs.fds.fds-paragraphs-micro` | `typography` |  |  |
| `fds-paragraphs-micro-bold` | `Paragraphs.fds.fds-paragraphs-micro-bold` | `typography` |  |  |


## Typography — Gaming

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-gaming-xsmall` | `Gaming.fds.fds-gaming-xsmall` | `typography` |  |  |
| `fds-gaming-small` | `Gaming.fds.fds-gaming-small` | `typography` |  |  |
| `fds-gaming-medium` | `Gaming.fds.fds-gaming-medium` | `typography` |  |  |
| `fds-gaming-large` | `Gaming.fds.fds-gaming-large` | `typography` |  |  |
| `fds-gaming-xlarge` | `Gaming.fds.fds-gaming-xlarge` | `typography` |  |  |
| `fds-gaming-xxlarge` | `Gaming.fds.fds-gaming-xxlarge` | `typography` |  |  |


## Typography — Sportsbook

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-sb-headings-regular` | `Sportsbook.fds-sb-headings-regular` | `typography` |  |  |
| `fds-sb-paragraph-lead` | `Sportsbook.fds-sb-paragraph-lead` | `typography` |  |  |
| `fds-sb-paragraph-lead-bold` | `Sportsbook.fds-sb-paragraph-lead-bold` | `typography` |  |  |
| `fds-sb-paragraph-regular` | `Sportsbook.fds-sb-paragraph-regular` | `typography` |  |  |
| `fds-sb-paragraph-regular-bold` | `Sportsbook.fds-sb-paragraph-regular-bold` | `typography` |  |  |
| `fds-sb-paragraph-small` | `Sportsbook.fds-sb-paragraph-small` | `typography` |  |  |
| `fds-sb-paragraph-small-bold` | `Sportsbook.fds-sb-paragraph-small-bold` | `typography` |  |  |
| `fds-sb-paragraph-tiny` | `Sportsbook.fds-sb-paragraph-tiny` | `typography` |  |  |
| `fds-sb-paragraph-tiny-bold` | `Sportsbook.fds-sb-paragraph-tiny-bold` | `typography` |  |  |
| `fds-sb-paragraph-tiny-bold-uppercase` | `Sportsbook.fds-sb-paragraph-tiny-bold-uppercase` | `typography` |  |  |
| `fds-sb-paragraph-micro` | `Sportsbook.fds-sb-paragraph-micro` | `typography` |  |  |
| `fds-sb-paragraphs-micro-bold` | `Sportsbook.fds-sb-paragraphs-micro-bold` | `typography` |  |  |
| `fds-sb-decoration-lead` | `Sportsbook.fds-sb-decoration-lead` | `typography` |  |  |
| `fds-sb-decoration-regular` | `Sportsbook.fds-sb-decoration-regular` | `typography` |  |  |
| `fds-sb-decoration-small` | `Sportsbook.fds-sb-decoration-small` | `typography` |  |  |
| `fds-sb-decoration-tiny` | `Sportsbook.fds-sb-decoration-tiny` | `typography` |  |  |


## Motion

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-motion-const-dust-std` | `fds-motion-friction-const.dust.fds-motion-const-dust-std` | `other` |  | Composite: Micro-state feedback. Immediate response (0ms delay) with a sharp linear-out stop for high-density UI responsiveness. |
| `fds-motion-const-pebble-in` | `fds-motion-friction-const.pebble.fds-motion-const-pebble-in` | `other` |  | Composite: Small element arrival (Badges/Icons). 40ms staggered delay allows motion to be perceived before full opacity. |
| `fds-motion-const-pebble-out` | `fds-motion-friction-const.pebble.fds-motion-const-pebble-out` | `other` |  | Composite: Small element dismissal. 0ms delay and accelerated exit for perceived performance. |
| `fds-motion-const-brick-in` | `fds-motion-friction-const.brick.fds-motion-const-brick-in` | `other` |  | Composite: Standard component arrival (Tooltips/Menus). 80ms delay creates an organic, 'weighted' feel during expansion. |
| `fds-motion-const-brick-out` | `fds-motion-friction-const.brick.fds-motion-const-brick-out` | `other` |  | Composite: Standard component collapse. Fast exit with no delay to ensure task completion feels instantaneous. |
| `fds-motion-const-boulder-in` | `fds-motion-friction-const.boulder.fds-motion-const-boulder-in` | `other` |  | Composite: Large surface entry (Modals/Drawers). 120ms staggered delay provides a premium, atmospheric arrival effect. |
| `fds-motion-const-boulder-out` | `fds-motion-friction-const.boulder.fds-motion-const-boulder-out` | `other` |  | Composite: Large surface dismissal. High acceleration off-canvas to clear the user's workspace immediately. |
| `fds-motion-const-mountain-std` | `fds-motion-friction-const.mountain.fds-motion-const-mountain-std` | `other` |  | Composite: Page-level layout swaps. Long duration and significant delay (150ms) for high-fidelity brand storytelling. |


## Z-Index — Constants

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-z-index-const-canvas` | `fds-z-index-const.layout.fds-z-index-const-canvas` | `other` |  | Baseline layer for page content. |
| `fds-z-index-const-drawer-scrim` | `fds-z-index-const.drawer-layer.fds-z-index-const-drawer-scrim` | `other` |  | Backdrop for drawers; blocks interaction with canvas content. |
| `fds-z-index-const-drawer` | `fds-z-index-const.drawer-layer.fds-z-index-const-drawer` | `other` |  | Modal-class drawer; sits above canvas but below global navigation per design choice. |
| `fds-z-index-const-docked` | `fds-z-index-const.navigation.fds-z-index-const-docked` | `other` |  | Global bottom or site navigation; remains interactive and visible above drawers. |
| `fds-z-index-const-snackbar` | `fds-z-index-const.contextual.fds-z-index-const-snackbar` | `other` |  | Short-lived status messages; appears above navigation. |
| `fds-z-index-const-popover` | `fds-z-index-const.contextual.fds-z-index-const-popover` | `other` |  | Contextual UI like tooltips and menus; must overlay navigation and drawers. |
| `fds-z-index-const-modal` | `fds-z-index-const.modal-layer.fds-z-index-const-modal` | `other` |  | Full blocking dialogs; overlays all standard UI including navigation. |
| `fds-z-index-const-priority` | `fds-z-index-const.system.fds-z-index-const-priority` | `other` |  | Absolute system-level priority; for critical alerts or overrides. |


## Z-Index — Scale

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-z-index-700` | `fds-z-index.fds-z-index-700` | `other` |  | Legacy fallback |
| `fds-z-index-750` | `fds-z-index.fds-z-index-750` | `other` |  |  |
| `fds-z-index-800` | `fds-z-index.fds-z-index-800` | `other` |  | Ex. fds-Dialog level |
| `fds-z-index-900` | `fds-z-index.fds-z-index-900` | `other` |  | Ex. fds-select level |
| `fds-z-index-950` | `fds-z-index.fds-z-index-950` | `other` |  | Ex. fds-snackbar level |
| `fds-z-index-1000` | `fds-z-index.fds-z-index-1000` | `other` |  | Ex. fds-tooltip level |
| `fds-z-index-1050` | `fds-z-index.fds-z-index-1050` | `other` |  |  |
| `fds-z-index-9999` | `fds-z-index.fds-z-index-9999` | `other` |  | Ex. fds-tooltip level |


## Blur

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-blur-sm` | `fds-blur.fds-blur-sm` | `dimension` |  | Subtle element blur — 12px. |
| `fds-blur-md` | `fds-blur.fds-blur-md` | `dimension` |  | Standard element blur — 24px. |
| `fds-blur-lg` | `fds-blur.fds-blur-lg` | `dimension` |  | Heavy element blur — 32px. |


## Misc

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-utility-const-invert` | `fds-utility-const.effects.fds-utility-const-invert` | `other` |  | filter: invert() toggle — 0 keeps assets un-inverted (default surface); 1 flips to white (alternate surface). |


## Gradient status tokens (fds-*-shade)

These are linear-gradient **paint styles** bound via `fillStyleId`, not a scalar `fills` NV variable. The NV `fills` array on nodes using them contains the two gradient stops (`ref/system/<status>/50` + `ref/system/<status>/60`). `hasFillNV()` correctly returns true via `fillStyleId` presence — **do not** flag these as `MISSING_NV_FILL`.

| Short Name | Token Studio Path | Type | Native Variable Name | Description |
|---|---|---|---|---|
| `fds-success-shade` | `var.fds.fds-success-shade` | `color` (linear-gradient) | *(paint style — `fillStyleId`)* | Gradient stops: `ref/system/success/50` + `ref/system/success/60`. |
| `fds-info-shade` | `var.fds.fds-info-shade` | `color` (linear-gradient) | *(paint style — `fillStyleId`)* | Gradient stops: `ref/system/info/50` + `ref/system/info/60`. |
| `fds-alert-shade` | `var.fds.fds-alert-shade` | `color` (linear-gradient) | *(paint style — `fillStyleId`)* | Gradient stops: `ref/system/alert/50` + `ref/system/alert/60`. |
| `fds-error-shade` | `var.fds.fds-error-shade` | `color` (linear-gradient) | *(paint style — `fillStyleId`)* | Gradient stops: `ref/system/error/50` + `ref/system/error/60`. |
