# Project Instructions for AI Agents

## Figma MCP Server Rules
- The Figma MCP server provides an assets endpoint which can serve image and SVG assets
- IMPORTANT: If the Figma MCP server returns a localhost source for an image or an SVG, use that image or SVG source directly
- IMPORTANT: DO NOT import/add new icon packages, all the assets should be in the Figma payload
- IMPORTANT: do NOT use or create placeholders if a localhost source is provided

## Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Required flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s).
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map and then re-fetch only the required node(s) with `get_design_context`.
3. Run `get_screenshot` for a visual reference of the node variant being implemented.
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation.
5. Validate against Figma for 1:1 look and behavior before marking complete.

## Skills

| Skill | Invocation | Purpose |
|-------|------------|---------|
| ODIN-9000 | `/odin-9000` | Orchestrator — runs the full MIMR → VALI → SAGA pipeline |
| MIMR | `/mimr` | Metadata Inventory & Mapping Repository — token extraction & bulk write |
| VALI | `/vali` | Visual Alignment & Layout Instantiator — frame → Auto Layout conversion |
| SAGA | `/saga` | Storybook Automation & Generative Asset — design context → HTML/CSS component |

**Default rule**: If a request involves Figma design, token extraction, layout conversion, or component generation and no `/skill` is specified, suggest `/odin-9000` before proceeding.

<!-- BEGIN HERCULES INTEGRATION v:1 -->
## Hercules Harness (memory & run state)

This project uses the **Hercules harness** instead of an external issue tracker. All persistent
memory is reached through one seam: `.github/prompts/.hercules/memory-adapter.md`.

### Rules

- Read `.github/prompts/manifest.json` first on every skill invocation.
- Track ALL task state through Hercules (`state.*` / `episode.*`) — do NOT use TodoWrite or markdown TODO lists for run tracking.
- Persist durable knowledge as lessons (`lesson.append`) — do NOT use MEMORY.md files.
- Every Figma write needs an `open → close` episode pair.

## Session Completion

When ending a work session, complete ALL steps. Work is NOT complete until `git push` succeeds.

1. **Capture follow-ups** — `state.openIssues[]` for anything unfinished; `lesson.append` for insights.
2. **Run quality gates** (if code changed) — tests, linters, builds.
3. **Close open runs** — `episode.append({phase:"close"})` for each finished run.
4. **PUSH TO REMOTE** (mandatory):
   ```bash
   git pull --rebase
   git add -A
   git commit -m "<summary>"
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** — clear stashes, prune remote branches.
6. **Verify** — all changes committed AND pushed.
7. **Hand off** — provide context for the next session.

**Critical rules:**
- Work is NOT complete until `git push` succeeds.
- NEVER stop before pushing — that strands work locally.
- If push fails, resolve and retry until it succeeds.
<!-- END HERCULES INTEGRATION -->
