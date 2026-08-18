/**
 * bulk-update.figma.js — Phase 3
 *
 * Applies Token Studio and/or native variable bindings to matched nodes.
 * Agent generates the ROOT_ID and RULES array from:
 *   - data/mapping-rules.md   (parsed YAML rule blocks)
 *   - Phase 2 audit output    (confirmed node context)
 *
 * ── Injected by agent before execution ──────────────────────────────────────
 *
 *   const ROOT_ID = "21774:64113";    // audited frame (colon format)
 *   const RULES   = [ ... ];          // generated from mapping-rules.md
 *
 * ── Rule shape ───────────────────────────────────────────────────────────────
 *
 *   {
 *     id:           string,               // rule.id from mapping-rules.md
 *     layerPattern: string,               // rule.layer_pattern
 *     matchType:    "exact"|"contains"|"regex",
 *     writes: [
 *       { type: "ts", key: string, value: string, rawValue?: string },
 *       // type "nv" is a manual override only — auto-NV resolution handles
 *       // the common case; explicit nv entries are still respected.
 *       { type: "nv", prop: string, varId: string },
 *       // type "border" decomposes a composite border token into atomic
 *       // width (float NV → 4 stroke weight props) + color (color NV → strokes[0] paint).
 *       { type: "border", widthToken: string, colorToken: string },
 *     ]
 *   }
 *
 * ── Auto NV resolution (per TS write) ────────────────────────────────────────
 *
 *   After each "ts" write the script:
 *   1. Converts the TS dot-path to NV slash-name (e.g. "a.b.c" → "a/b/c")
 *   2. Searches getLocalVariablesAsync() for an exact name match
 *   3. If found  → calls setBoundVariable for every prop in TS_TO_BIND_PROPS
 *                  (e.g. borderRadius binds all 4 corner props)
 *                  Figma then resolves the visual value natively.
 *   4. If not found AND rawValue is set → applyRawValue() updates the style
 *                  directly so the visual appearance reflects the new token.
 *
 *   Fill NV binding is intentionally excluded from auto-resolution because
 *   Figma requires setBoundVariableForPaint() per paint entry — the rawValue
 *   fallback handles solid and gradient fills instead.
 *
 * ── Output (returned as JSON string) ─────────────────────────────────────────
 *
 *   {
 *     applied: number,
 *     failed:  number,
 *     report:  [ { rule, nodeId, nodeName, type, status, before?, after?, error? } ]
 *   }
 */

const TS_NAMESPACE = 'tokens';

// ─── TS key → Figma node property mapping ────────────────────────────────────

const TS_TO_NV_PROP = {
  fill:               'fills',
  borderRadius:       'cornerRadius',
  borderWidth:        'strokeWeight',       // sets all 4 sides
  borderWidthTop:     'strokeTopWeight',
  borderWidthBottom:  'strokeBottomWeight',
  borderWidthLeft:    'strokeLeftWeight',
  borderWidthRight:   'strokeRightWeight',
  paddingLeft:        'paddingLeft',
  paddingRight:       'paddingRight',
  paddingTop:         'paddingTop',
  paddingBottom:      'paddingBottom',
  horizontalPadding:  'paddingLeft',   // sets both left + right
  verticalPadding:    'paddingTop',    // sets both top + bottom
  itemSpacing:        'itemSpacing',
  opacity:            'opacity',
  width:              'width',
  height:             'height',
};

// TS key → setBoundVariable prop(s)
// borderRadius needs all 4 corners; fill excluded (requires setBoundVariableForPaint)
const TS_TO_BIND_PROPS = {
  borderRadius:       ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'],
  borderWidth:        ['strokeTopWeight', 'strokeBottomWeight', 'strokeLeftWeight', 'strokeRightWeight'],
  borderWidthTop:     ['strokeTopWeight'],
  borderWidthBottom:  ['strokeBottomWeight'],
  borderWidthLeft:    ['strokeLeftWeight'],
  borderWidthRight:   ['strokeRightWeight'],
  paddingLeft:        ['paddingLeft'],
  paddingRight:       ['paddingRight'],
  paddingTop:         ['paddingTop'],
  paddingBottom:      ['paddingBottom'],
  horizontalPadding:  ['paddingLeft', 'paddingRight'],
  verticalPadding:    ['paddingTop', 'paddingBottom'],
  itemSpacing:        ['itemSpacing'],
  opacity:            ['opacity'],
  width:              ['width'],
  height:             ['height'],
};

/** Convert TS dot-path → NV slash-name: "a.b.c" → "a/b/c" */
function tsPathToNvName(tsPath) {
  return tsPath.replace(/\./g, '/');
}

/**
 * Detect gradient TS paths.  In this design system every TS token whose
 * **last segment** ends with `-shade` or `-g` is a gradient (GRADIENT_LINEAR)
 * stored as a Figma paint style — NOT a native variable.
 *
 * Examples:
 *   var.btn.fds-btn-accent-shade   → gradient
 *   var.btn.fds-btn-accent-g       → gradient
 *   var.btn.fds-btn-accent         → solid (normal variable)
 */
function isGradientToken(tsPath) {
  const last = tsPath.split('.').pop() || '';
  return last.endsWith('-shade') || last.endsWith('-g');
}

/**
 * Convert a TS dot-path to the paint style name used in Figma.
 * TS uses dots, paint style names use slashes, and the leading group
 * prefix may differ.  "var.btn.fds-btn-accent-shade" → "btn/fds-btn-accent-shade".
 * We strip the first segment when it equals 'var' (semantic namespace prefix)
 * then join with '/'.
 */
function tsPathToPaintStyleName(tsPath) {
  const parts = tsPath.split('.');
  // Strip leading 'var' namespace prefix if present
  if (parts[0] === 'var') parts.shift();
  return parts.join('/');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matchesPattern(name, pattern, matchType) {
  if (matchType === 'exact')    return name === pattern;
  if (matchType === 'contains') return name.includes(pattern);
  if (matchType === 'regex') {
    try { return new RegExp(pattern).test(name); }
    catch(e) { return false; }
  }
  return false;
}

function collectNodes(node, pattern, matchType, results = []) {
  if (!node) return results;
  if (matchesPattern(node.name, pattern, matchType)) results.push(node);
  const children = ('children' in node) ? node.children : [];
  for (const child of children) collectNodes(child, pattern, matchType, results);
  return results;
}

/** Returns true when the node already has a native variable bound to nvProp. */
function hasNvBinding(node, nvProp) {
  const bv = node.boundVariables;
  if (!bv) return false;
  const b = bv[nvProp];
  return b != null && (Array.isArray(b) ? b.length > 0 : true);
}

/** Parse a CSS color string → { r, g, b } (0-1 range) + opacity. */
function parseCssColor(str) {
  const rgba = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgba) {
    return {
      r: parseFloat(rgba[1]) / 255,
      g: parseFloat(rgba[2]) / 255,
      b: parseFloat(rgba[3]) / 255,
      a: rgba[4] !== undefined ? parseFloat(rgba[4]) : 1,
    };
  }
  const hex = str.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  return null;
}

/** Parse the leading numeric value from a CSS string, e.g. "16px" → 16. */
function parseCssNumber(str) {
  const m = String(str).match(/^([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

/**
 * Parse a CSS linear-gradient string → Figma GRADIENT_LINEAR fill.
 * Handles: linear-gradient(Ndeg, color1 P1%, color2 P2%, ...)
 */
function parseCssLinearGradient(str) {
  const m = str.match(/^linear-gradient\(\s*([\d.]+)deg\s*,(.*)\)$/s);
  if (!m) return null;
  const angle = parseFloat(m[1]);
  const stopParts = m[2].split(',');
  const stops = [];
  for (const part of stopParts) {
    const sp = part.trim();
    const posMatch = sp.match(/(.*?)\s+([\d.]+)%\s*$/);
    if (!posMatch) return null;
    const color = parseCssColor(posMatch[1].trim());
    if (!color) return null;
    stops.push({ color, position: parseFloat(posMatch[2]) / 100 });
  }
  // Convert CSS angle to normalized [0,1] start/end points.
  // CSS: 0deg=to top, 90deg=to right, 135deg=to bottom-right.
  const rad = angle * Math.PI / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const startX = 0.5 - dx * 0.5;
  const startY = 0.5 - dy * 0.5;
  const endX   = 0.5 + dx * 0.5;
  const endY   = 0.5 + dy * 0.5;
  const a = endX - startX;
  const c = endY - startY;
  const gradientTransform = [[a, -c, startX], [c, a, startY]];
  return { stops, gradientTransform };
}

/**
 * Apply a raw CSS value to the node's Figma style property.
 * Returns { status, prop, rawValue } or { status: 'skipped', reason }.
 */
function applyRawValue(node, tsKey, rawValue) {
  const nvProp = TS_TO_NV_PROP[tsKey];
  if (!nvProp) {
    return { status: 'skipped', reason: `no style mapping for TS key "${tsKey}"` };
  }

  // fills — solid color or linear gradient
  if (nvProp === 'fills') {
    const color = parseCssColor(rawValue);
    if (color) {
      const { a, ...rgb } = color;
      node.fills = [{ type: 'SOLID', color: rgb, opacity: a }];
      return { status: 'ok', prop: nvProp, rawValue };
    }
    const gradient = parseCssLinearGradient(rawValue);
    if (gradient) {
      node.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientTransform: gradient.gradientTransform,
        gradientStops: gradient.stops.map(s => ({
          color: { r: s.color.r, g: s.color.g, b: s.color.b, a: s.color.a },
          position: s.position,
        })),
        opacity: 1,
      }];
      return { status: 'ok', prop: nvProp, rawValue };
    }
    return { status: 'skipped', reason: `cannot parse fill value: "${rawValue}"` };
  }

  // horizontalPadding → both sides
  if (tsKey === 'horizontalPadding') {
    const num = parseCssNumber(rawValue);
    if (num === null) return { status: 'skipped', reason: `cannot parse number from "${rawValue}"` };
    node.paddingLeft  = num;
    node.paddingRight = num;
    return { status: 'ok', prop: 'paddingLeft/paddingRight', rawValue };
  }

  // verticalPadding → both sides
  if (tsKey === 'verticalPadding') {
    const num = parseCssNumber(rawValue);
    if (num === null) return { status: 'skipped', reason: `cannot parse number from "${rawValue}"` };
    node.paddingTop    = num;
    node.paddingBottom = num;
    return { status: 'ok', prop: 'paddingTop/paddingBottom', rawValue };
  }

  // all other numeric properties
  const num = parseCssNumber(rawValue);
  if (num === null) {
    return { status: 'skipped', reason: `cannot parse number from "${rawValue}"` };
  }
  node[nvProp] = num;
  return { status: 'ok', prop: nvProp, rawValue };
}

// ─── Execute rules (chunked for large trees) ─────────────────────────────────

const root = await figma.getNodeByIdAsync(ROOT_ID);
if (!root) return JSON.stringify({ error: `Root node "${ROOT_ID}" not found` });

// ── Lazy variable / paint-style resolution ───────────────────────────────────
// Optional injected cache (from .hercules/cache/vars-<fileKey>-<version>.json):
//   const CACHE_VAR_IDS   = { "<var/name>": "VariableID:...", ... };
//   const CACHE_STYLE_IDS = { "<style/name>": "S:...", ... };
// When present we resolve ONLY the few names actually used via getVariableByIdAsync,
// avoiding getLocalVariablesAsync (slow: 500+ vars) / getLocalPaintStylesAsync on every run.
// When absent we fall back to a one-time full load (previous behaviour).
const VAR_NAME_TO_ID   = (typeof CACHE_VAR_IDS   !== 'undefined') ? CACHE_VAR_IDS   : null;
const STYLE_NAME_TO_ID = (typeof CACHE_STYLE_IDS !== 'undefined') ? CACHE_STYLE_IDS : null;

let _varsByName = null, _paintStylesByName = null;
const _resolvedById = new Map();

async function resolveVarByName(name) {
  if (VAR_NAME_TO_ID) {
    const id = VAR_NAME_TO_ID[name];
    if (!id) return null;
    if (_resolvedById.has(id)) return _resolvedById.get(id);
    const v = await figma.variables.getVariableByIdAsync(id);
    _resolvedById.set(id, v);
    return v;
  }
  if (!_varsByName) {
    const allVars = await figma.variables.getLocalVariablesAsync();
    _varsByName = new Map(allVars.map(v => [v.name, v]));
  }
  return _varsByName.get(name) ?? null;
}

async function resolvePaintStyleByName(name) {
  if (STYLE_NAME_TO_ID) {
    const id = STYLE_NAME_TO_ID[name];
    if (!id) return null;
    try { return (await figma.getStyleByIdAsync(id)) ?? null; } catch (_) { return null; }
  }
  if (!_paintStylesByName) {
    const allPaintStyles = await figma.getLocalPaintStylesAsync();
    _paintStylesByName = new Map(allPaintStyles.map(s => [s.name, s]));
  }
  return _paintStylesByName.get(name) ?? null;
}

// Pre-collect all (rule, node) pairs into a flat work queue.
// This avoids re-walking the tree per rule and enables chunked processing.
const workQueue = [];
for (const rule of RULES) {
  const nodes = collectNodes(root, rule.layerPattern, rule.matchType);
  for (const node of nodes) {
    workQueue.push({ rule, node });
  }
}

const CHUNK_SIZE = 100;
const report = [];

for (let chunkStart = 0; chunkStart < workQueue.length; chunkStart += CHUNK_SIZE) {
  const chunk = workQueue.slice(chunkStart, chunkStart + CHUNK_SIZE);

  for (const { rule, node } of chunk) {
    for (const write of rule.writes) {
      try {

        // — Token Studio write + auto NV resolution ───────────────────────────
        if (write.type === 'ts') {
          const stored = `"${write.value}"`;
          const before = node.getSharedPluginData(TS_NAMESPACE, write.key);
          node.setSharedPluginData(TS_NAMESPACE, write.key, stored);
          const after  = node.getSharedPluginData(TS_NAMESPACE, write.key);
          report.push({
            rule: rule.id, nodeId: node.id, nodeName: node.name,
            type: 'ts', key: write.key, before, after, status: 'ok',
          });

          // 0. Gradient fill: if the TS path ends with -shade or -g, this
          //    is a gradient paint style — apply via fillStyleId, not NV.
          if (write.key === 'fill' && isGradientToken(write.value)) {
            const styleName = tsPathToPaintStyleName(write.value);
            const style = await resolvePaintStyleByName(styleName);
            if (style) {
              node.fillStyleId = style.id;
              report.push({
                rule: rule.id, nodeId: node.id, nodeName: node.name,
                type: 'paint-style', prop: 'fillStyleId', styleId: style.id, styleName: style.name, status: 'ok',
              });
            } else {
              report.push({
                rule: rule.id, nodeId: node.id, nodeName: node.name,
                type: 'paint-style', prop: 'fillStyleId', status: 'error',
                error: `Paint style "${styleName}" not found (gradient token: ${write.value})`,
              });
            }
            continue; // skip NV / rawValue path for gradients
          }

          // 1. Auto-NV: find a variable whose name matches the TS dot-path
          //    converted to slash-name (dots → slashes).
          //    Excluded: fill — requires setBoundVariableForPaint per paint entry.
          const bindProps = TS_TO_BIND_PROPS[write.key];
          let nvBound = false;

          if (bindProps) {
            const nvName = tsPathToNvName(write.value);
            const v = await resolveVarByName(nvName);
            if (v) {
              for (const prop of bindProps) {
                try {
                  node.setBoundVariable(prop, v);
                  report.push({
                    rule: rule.id, nodeId: node.id, nodeName: node.name,
                    type: 'nv-auto', prop, varId: v.id, varName: v.name, status: 'ok',
                  });
                } catch (e) {
                  report.push({
                    rule: rule.id, nodeId: node.id, nodeName: node.name,
                    type: 'nv-auto', prop, status: 'error', error: e.message,
                  });
                }
              }
              nvBound = true;
            }
          }

          // 2. Raw value fallback: only when no NV was auto-bound
          //    For fill, also check for a pre-existing NV binding on 'fills'.
          if (!nvBound && write.rawValue) {
            const nvProp = TS_TO_NV_PROP[write.key];
            if (nvProp && !hasNvBinding(node, nvProp)) {
              const r = applyRawValue(node, write.key, write.rawValue);
              report.push({
                rule: rule.id, nodeId: node.id, nodeName: node.name,
                type: 'component-value', key: write.key, ...r,
              });
            }
          }
        }

        // — Native variable write (manual override) ───────────────────────────
        else if (write.type === 'nv') {
          const v = await figma.variables.getVariableByIdAsync(write.varId);
          if (!v) throw new Error(`Variable "${write.varId}" not found`);
          node.setBoundVariable(write.prop, v);
          report.push({
            rule: rule.id, nodeId: node.id, nodeName: node.name,
            type: 'nv', prop: write.prop, varId: write.varId, varName: v.name, status: 'ok',
          });
        }

        // — Composite border write (decomposed width + color) ────────────────
        // Applies atomic width NV to all 4 stroke weight props and
        // atomic color NV to the first stroke paint entry.
        // Rule shape: { type: "border", widthToken: "fds-stroke.fds-stroke-100", colorToken: "var.fds.fds-on-surface-low" }
        else if (write.type === 'border') {
          // 1. Width: resolve NV and bind to all 4 stroke weight props
          const widthNvName = tsPathToNvName(write.widthToken);
          const widthVar = await resolveVarByName(widthNvName);
          if (widthVar) {
            const widthProps = ['strokeTopWeight', 'strokeBottomWeight', 'strokeLeftWeight', 'strokeRightWeight'];
            for (const wp of widthProps) {
              node.setBoundVariable(wp, widthVar);
            }
            // TS metadata for width
            node.setSharedPluginData(TS_NAMESPACE, 'borderWidth', `"${write.widthToken}"`);
            report.push({
              rule: rule.id, nodeId: node.id, nodeName: node.name,
              type: 'border-width', prop: 'strokeWeight(4)', varName: widthVar.name, status: 'ok',
            });
          } else {
            report.push({
              rule: rule.id, nodeId: node.id, nodeName: node.name,
              type: 'border-width', status: 'error',
              error: `Width variable "${widthNvName}" not found`,
            });
          }

          // 2. Color: resolve NV and bind to stroke paint
          if (write.colorToken === 'transparent') {
            // Transparent: no color variable — set a transparent solid stroke
            node.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }];
            report.push({
              rule: rule.id, nodeId: node.id, nodeName: node.name,
              type: 'border-color', prop: 'strokes', status: 'ok', note: 'color-transparent',
            });
          } else {
            const colorNvName = tsPathToNvName(write.colorToken);
            const colorVar = await resolveVarByName(colorNvName);
            if (colorVar) {
              // Ensure node has at least one stroke paint to bind to
              if (!node.strokes || node.strokes.length === 0) {
                node.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 }];
              }
              const strokes = JSON.parse(JSON.stringify(node.strokes));
              strokes[0] = figma.variables.setBoundVariableForPaint(strokes[0], 'color', colorVar);
              node.strokes = strokes;

              // TS metadata for stroke color
              node.setSharedPluginData(TS_NAMESPACE, 'borderColor', `"${write.colorToken}"`);
              report.push({
                rule: rule.id, nodeId: node.id, nodeName: node.name,
                type: 'border-color', prop: 'strokes[0]', varName: colorVar.name, status: 'ok',
              });
            } else {
              report.push({
                rule: rule.id, nodeId: node.id, nodeName: node.name,
                type: 'border-color', status: 'error',
                error: `Color variable "${colorNvName}" not found`,
              });
            }
          }
        }

      } catch (e) {
        report.push({
          rule: rule.id, nodeId: node.id, nodeName: node.name,
          status: 'error', error: e.message,
        });
      }
    }
  }
}

// ─── Return ───────────────────────────────────────────────────────────────────

const applied = report.filter(r => r.status === 'ok').length;
const failed  = report.filter(r => r.status === 'error').length;

return JSON.stringify({ applied, failed, totalWork: workQueue.length, report }, null, 2);
