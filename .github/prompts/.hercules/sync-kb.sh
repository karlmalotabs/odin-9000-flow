#!/usr/bin/env bash
# sync-kb.sh — keep the Librarian's local mirror of the external Token Studio JSON
# and KB repos fresh, using a cheap SHA staleness check + sparse checkout.
#
# Source of truth for repo slugs/branches/paths: .github/prompts/manifest.json → skills.librarian.sync
# Fill the {{KB_REPO}} placeholder there (and TOKENS_REPO below) before first use.
#
# Usage:
#   sync-kb.sh            # staleness check; pull only if the remote SHA changed
#   sync-kb.sh --force    # always re-pull
#
# Auth: relies on your existing `gh`/SSH git credentials. No tokens are stored here.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
CACHE="$ROOT/.github/prompts/.hercules/cache"
MANIFEST="$CACHE/kb-manifest.json"
FORCE="${1:-}"

# ── Repo config (edit these or wire from manifest.json) ──────────────────────
TOKENS_REPO="${TOKENS_REPO:-BetssonGroup/core-design-system-variables}"   # large Token Studio JSON
TOKENS_BRANCH="${TOKENS_BRANCH:-main}"
TOKENS_PATHS="${TOKENS_PATHS:-data}"                        # sparse dir (ts-*-fabric.json live under data/)
KB_REPO="${KB_REPO:-BetssonGroup/betsson-kb-docs}"          # indexed KB .md repo
KB_BRANCH="${KB_BRANCH:-feat/fds-token-docs-refactor}"      # token-docs refactor branch (default branch renamed index.md → tokens.md)
KB_PATHS="${KB_PATHS:-knowledge/shared/global/design-standards/tokens}"

mkdir -p "$CACHE"
[ -f "$MANIFEST" ] || echo '{}' > "$MANIFEST"

# read a cached SHA: jq if available, else grep fallback
cached_sha() {
  local key="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -r --arg k "$key" '.[$k].sha // ""' "$MANIFEST" 2>/dev/null
  else
    grep -o "\"$key\"[^}]*\"sha\":\"[^\"]*\"" "$MANIFEST" 2>/dev/null | grep -o '"sha":"[^"]*"' | cut -d'"' -f4
  fi
}

write_sha() {
  local key="$1" sha="$2" path="$3"
  if command -v jq >/dev/null 2>&1; then
    local tmp; tmp="$(mktemp)"
    jq --arg k "$key" --arg s "$sha" --arg p "$path" --arg t "$(date -u +%FT%TZ)" \
      '.[$k]={sha:$s,path:$p,syncedAt:$t}' "$MANIFEST" > "$tmp" && mv "$tmp" "$MANIFEST"
  else
    printf '{"%s":{"sha":"%s","path":"%s"}}\n' "$key" "$sha" "$path" > "$MANIFEST"
  fi
}

sparse_clone_or_pull() {
  local key="$1" repo="$2" branch="$3" paths="$4"
  local dest="$CACHE/$key"

  # Resolve a clone URL — prefer gh, fall back to https
  local url
  if command -v gh >/dev/null 2>&1; then
    url="$(gh repo view "$repo" --json url -q .url 2>/dev/null || echo "https://github.com/$repo")"
  else
    url="https://github.com/$repo"
  fi

  # Cheap staleness probe — one network round-trip
  local latest
  latest="$(git ls-remote "$url" "refs/heads/$branch" 2>/dev/null | awk '{print $1}')"
  if [ -z "$latest" ]; then
    echo "⚠️  $key: could not reach $repo ($branch). Skipping (using cache if present)." >&2
    return 0
  fi

  local have; have="$(cached_sha "$key")"
  if [ "$FORCE" != "--force" ] && [ "$have" = "$latest" ] && [ -d "$dest" ]; then
    echo "✓ $key: up to date (${latest:0:8})"
    return 0
  fi

  if [ -d "$dest/.git" ]; then
    git -C "$dest" fetch --depth 1 origin "$branch" -q
    git -C "$dest" checkout -q "$branch"
    git -C "$dest" reset --hard -q "origin/$branch"
  else
    rm -rf "$dest"
    git clone --depth 1 --filter=blob:none --sparse --branch "$branch" -q "$url" "$dest"
    git -C "$dest" sparse-checkout set $paths
  fi

  write_sha "$key" "$latest" "$dest"
  echo "⬇️  $key: synced to ${latest:0:8}"
}

sparse_clone_or_pull "tokens" "$TOKENS_REPO" "$TOKENS_BRANCH" "$TOKENS_PATHS"
if [ "$KB_REPO" != "{{KB_REPO}}" ]; then
  sparse_clone_or_pull "kb" "$KB_REPO" "$KB_BRANCH" "$KB_PATHS"
else
  echo "ℹ️  KB repo not configured (placeholder). Set KB_REPO in manifest.json to enable."
fi
