# Agent Instructions

This project uses the **Hercules harness** for run state, an episode journal, and agent lessons.
Read `.github/prompts/manifest.json` first, then `.github/prompts/.hercules/memory-adapter.md` for
the memory seam. There is no Beads / `bd`.

## Quick Reference

```text
manifest.json         # tiny skill→files map, read FIRST on every invocation
memory-adapter.md     # the only place that knows where memory lives
state.write(runId)    # open/update a run (replaces issue create/claim)
lesson.recall([skill])# load lessons before work
episode.append({...}) # open/close audit trail (replaces issue close)
```

## Skills

For Figma design, token extraction, layout conversion, or component generation, invoke `/odin-9000`.

## Non-Interactive Shell Commands

**ALWAYS use non-interactive flags** with file operations to avoid hanging on confirmation prompts.

Shell commands like `cp`, `mv`, and `rm` may be aliased to include `-i` (interactive) mode on some systems, causing the agent to hang indefinitely waiting for y/n input.

**Use these forms instead:**
```bash
# Force overwrite without prompting
cp -f source dest           # NOT: cp source dest
mv -f source dest           # NOT: mv source dest
rm -f file                  # NOT: rm file

# For recursive operations
rm -rf directory            # NOT: rm -r directory
cp -rf source dest          # NOT: cp -r source dest
```

**Other commands that may prompt:**
- `scp` - use `-o BatchMode=yes` for non-interactive
- `ssh` - use `-o BatchMode=yes` to fail instead of prompting
- `apt-get` - use `-y` flag
- `brew` - use `HOMEBREW_NO_AUTO_UPDATE=1` env var

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
