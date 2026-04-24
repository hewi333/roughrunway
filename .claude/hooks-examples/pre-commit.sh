#!/usr/bin/env bash
# Example pre-commit hook. Install:
#   cp .claude/hooks-examples/pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
set -euo pipefail

echo "▶ typecheck"
npm run typecheck

echo "▶ lint"
npm run lint

echo "▶ unit tests"
npm run test:unit

echo "▶ metadata validate"
npm run meta:validate || {
  echo "Hint: run 'npm run meta:generate' if routes/components/functions changed." >&2
  exit 1
}

echo "✓ pre-commit green"
