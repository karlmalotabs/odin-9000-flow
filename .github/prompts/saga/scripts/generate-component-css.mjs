#!/usr/bin/env node
/**
 * generate-component-css.mjs — Generate a shadow-DOM scoped CSS skeleton
 * from a component spec JSON, with all --fds-* token vars and fallbacks.
 *
 * SAGA uses this to get a ready-made CSS base, then only adjusts if needed.
 * Eliminates the 11-reread / 117s generation loop.
 *
 * Usage:
 *   echo '<spec-json>' | node generate-component-css.mjs --name fds-bonus-bar [--out path]
 *
 * Spec shape:
 *   {
 *     "shadow": true,
 *     "host": { tokens: { paddingH: {var,fallback}, borderRadius: {var,fallback} } },
 *     "nodes": [
 *       {
 *         "class": "card",
 *         "comment": "Coloured surface",
 *         "layout": "flex-col",  // flex-row | flex-col | block
 *         "flex": "1 0 0",       // optional
 *         "tokens": {
 *           "background": { "var": "--fds-info", "fallback": "#608df2" },
 *           "border": { "widthVar": "--fds-stroke-100", "colorVar": "--fds-on-surface-ulow", "wFallback": "1px", "cFallback": "rgba(0,0,0,0.1)" },
 *           "padding": { "var": "--fds-spacing-200", "fallback": "16px" },
 *           "borderRadius": { "var": "--fds-round-150", "fallback": "12px" },
 *           "gap": { "var": "--fds-spacing-050", "fallback": "4px" },
 *           "color": { "var": "--fds-on-info-alternate", "fallback": "#fff" }
 *         }
 *       },
 *       {
 *         "class": "subtitle",
 *         "comment": "fds-paragraphs-small",
 *         "typography": { "fontFamily": "Open Sans", "fontSize": "12px", "lineHeight": "16px", "fontWeight": "400" }
 *       }
 *     ]
 *   }
 */

import { readFileSync, writeFileSync } from "fs";
import { argv } from "process";

// ── Parse args ──
const args = {};
for (let i = 2; i < argv.length; i++) {
  if (argv[i] === "--name") args.name = argv[++i];
  else if (argv[i] === "--out") args.out = argv[++i];
  else if (argv[i] === "--spec") args.specFile = argv[++i];
}

if (!args.name) {
  console.error(
    "Usage: echo <spec> | node generate-component-css.mjs --name <tag-name> [--out path]",
  );
  process.exit(1);
}

// ── Read spec ──
let specJson;
if (args.specFile) {
  specJson = readFileSync(args.specFile, "utf8");
} else {
  specJson = readFileSync("/dev/stdin", "utf8");
}
const spec = JSON.parse(specJson);

// ── Generate CSS ──
const lines = [];
const sep = "─".repeat(45);

lines.push(`/* ${sep}`);
lines.push(`   ${args.name} — scoped shadow styles`);
lines.push(`   Token Studio bindings with resolved fallbacks.`);
lines.push(`   All token-bound values use --fds-* custom props.`);
lines.push(`   ${sep} */`);
lines.push(``);

// Host block
if (spec.host || spec.shadow !== false) {
  const h = spec.host || {};
  const tokens = h.tokens || {};
  lines.push(`/* ── Host ──${sep.slice(0, 33)} */`);
  lines.push(`:host {`);
  lines.push(`  display: block;`);
  lines.push(`  box-sizing: border-box;`);
  if (tokens.paddingH)
    lines.push(
      `  padding: 0 var(${tokens.paddingH.var}, ${tokens.paddingH.fallback});`,
    );
  if (tokens.padding)
    lines.push(
      `  padding: var(${tokens.padding.var}, ${tokens.padding.fallback});`,
    );
  if (tokens.borderRadius)
    lines.push(
      `  border-radius: var(${tokens.borderRadius.var}, ${tokens.borderRadius.fallback});`,
    );
  if (tokens.background)
    lines.push(
      `  background: var(${tokens.background.var}, ${tokens.background.fallback});`,
    );
  if (h.width) lines.push(`  width: ${h.width};`);
  if (h.maxWidth) lines.push(`  max-width: ${h.maxWidth};`);
  lines.push(`}`);
  lines.push(``);
}

// Node blocks
for (const node of spec.nodes || []) {
  const comment = node.comment ? ` — ${node.comment}` : "";
  lines.push(`/* ── .${node.class}${comment} ── */`);
  lines.push(`.${node.class} {`);

  // Layout
  if (node.layout === "flex-row" || node.layout === "flex-col") {
    lines.push(`  display: flex;`);
    if (node.layout === "flex-col") lines.push(`  flex-direction: column;`);
    if (node.align) lines.push(`  align-items: ${node.align};`);
    if (node.justify) lines.push(`  justify-content: ${node.justify};`);
  }
  if (node.flex) lines.push(`  flex: ${node.flex};`);
  if (node.shrink === false) lines.push(`  flex-shrink: 0;`);
  if (node.width) lines.push(`  width: ${node.width};`);
  if (node.minWidth) lines.push(`  min-width: ${node.minWidth};`);
  if (node.size) {
    lines.push(`  width: ${node.size};`);
    lines.push(`  height: ${node.size};`);
  }

  // Tokens
  const t = node.tokens || {};
  if (t.background)
    lines.push(
      `  background: var(${t.background.var}, ${t.background.fallback});`,
    );
  if (t.color) lines.push(`  color: var(${t.color.var}, ${t.color.fallback});`);
  if (t.border) {
    lines.push(
      `  border: var(${t.border.widthVar}, ${t.border.wFallback}) solid var(${t.border.colorVar}, ${t.border.cFallback});`,
    );
  }
  if (t.borderRadius)
    lines.push(
      `  border-radius: var(${t.borderRadius.var}, ${t.borderRadius.fallback});`,
    );
  if (t.padding)
    lines.push(`  padding: var(${t.padding.var}, ${t.padding.fallback});`);
  if (t.paddingH)
    lines.push(`  padding: 0 var(${t.paddingH.var}, ${t.paddingH.fallback});`);
  if (t.gap) lines.push(`  gap: var(${t.gap.var}, ${t.gap.fallback});`);

  // Typography
  if (node.typography) {
    const ty = node.typography;
    lines.push(`  font-family: '${ty.fontFamily}', sans-serif;`);
    lines.push(`  font-weight: ${ty.fontWeight};`);
    lines.push(`  font-size: ${ty.fontSize};`);
    lines.push(`  line-height: ${ty.lineHeight};`);
  }

  // Common resets
  if (node.element === "p" || node.typography) lines.push(`  margin: 0;`);
  if (node.wordBreak) lines.push(`  word-break: break-word;`);

  lines.push(`  box-sizing: border-box;`);
  lines.push(`}`);
  lines.push(``);
}

const css = lines.join("\n");

if (args.out) {
  writeFileSync(args.out, css, "utf8");
  console.log(
    JSON.stringify({
      ok: true,
      path: args.out,
      classes: (spec.nodes || []).length,
    }),
  );
} else {
  console.log(css);
}
