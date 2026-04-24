#!/usr/bin/env bash
# Example post-edit hook for Claude Code. Regenerates metadata after route/component edits.
# Wire up via ~/.claude/settings.json or .claude/settings.json:
#   {
#     "hooks": {
#       "PostToolUse": [{ "matcher": "Write|Edit", "command": ".claude/hooks-examples/post-edit.sh" }]
#     }
#   }
set -euo pipefail

# Only regen if api routes, components, or lib functions changed in the last commit-ish window.
if git diff --name-only HEAD 2>/dev/null | grep -qE '^(app/api/|components/|lib/)'; then
  node .claude/scripts/generate-metadata.js >/dev/null
fi
