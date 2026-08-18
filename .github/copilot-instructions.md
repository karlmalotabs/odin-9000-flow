## Issue Tracking & Memory

This project uses the **Hercules harness** for persistent run state, an episode journal, and
agent lessons. There is **no Beads / `bd`** anymore. All memory goes through the adapter seam:

- Seam: `.github/prompts/.hercules/memory-adapter.md` (the only place that knows where memory lives)
- Journal: `.github/prompts/.hercules/episodes.jsonl` (the `open → close` audit trail)
- Lessons: `.github/prompts/.hercules/lessons.jsonl` (read at startup, written during Observe)
- Live state: `.github/prompts/.hercules/state/<runId>.json` (volatile, gitignored)

**Quick reference:**
- Read `.github/prompts/manifest.json` first — it maps every skill to its files + load triggers.
- Open a run → `state.write` + `episode.append({phase:"open"})`.
- Recall lessons → `lesson.recall([skill])` before doing work.
- Close a run → `episode.append({phase:"close"})`.

## Skill Execution Protocol

Whenever a skill (prompt) is invoked via `/skill-name` in chat, you MUST:

1. **Manifest**: read `.github/prompts/manifest.json` and the memory adapter before any work.
2. **Open**: open a Hercules run — `state.write(runId, …)` + `episode.append({phase:"open", skill, summary})`. The summary names the component by type/variant, **never a node ID**.
3. **Recall**: `lesson.recall([skill])` and honour returned lessons.
4. **Work**: execute the skill as instructed (self-check gate: confirm scripts loaded first).
5. **Observe**: append outcomes to state; capture lesson candidates via `lesson.append`.
6. **Close**: `episode.append({phase:"close", skill, summary})` when the skill finishes, **then reconcile** — `lesson.sweep()` for pending rule proposals (`applied=false` + non-null `ruleProposal`). If any exist, surface them in a single gated `vscode_askQuestions` prompt; apply only the approved diffs to their data files and `lesson.update` those lines to `applied=true`. Empty sweep → finish silently. Close always means "close **and** reconcile."

## Mid-session Modification Rule

Any user request that modifies Figma — even a single property change — after a run is closed
MUST start a NEW `runId` before executing. Do NOT mutate a closed run's state.

This applies to: follow-up token corrections, additional bindings, layout tweaks, or any "also
do this" request arriving after close. Every Figma write must have an `open → close` episode
pair. This is training data.

