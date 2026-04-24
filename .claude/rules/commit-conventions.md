# Commit Conventions

Derived from the existing git history — Conventional Commits is already the de-facto standard in this repo.

## Format

```
<type>: <short summary>

[optional body explaining why]
```

## Types in use

| Type | When |
|---|---|
| `feat:` | A new feature or user-visible capability |
| `fix:` | A bug fix |
| `docs:` | Documentation-only change (README, `docs/*`, `.claude/*`) |
| `refactor:` | Internal change with no behavior difference |
| `chore:` | Infrastructure, deps, tooling, CI tweaks |
| `test:` | Adding or updating tests only |

## Rules

- Summary in **lowercase** imperative: `feat: add scenario template for bear market`.
- Keep summary under ~72 chars.
- Reference PRs/issues in the body when helpful, not the subject.
- One logical change per commit. If you find yourself writing `and` in the summary, split the commit.

## Examples from history (mimic these)

```
feat: roughrunway-mcp — Claude Desktop MCP server package
fix: exclude mcp/ from Next.js tsconfig to prevent build failure
docs: rewrite README for hackathon judges
feat: /api/agent/encode — instant shareUrl with zero latency for AI agents
feat: shareable URLs and import/export dialogs
```

## Things not to do

- Don't use uppercase types (`FEAT:`, `Fix:`).
- Don't add scopes unless they help (`feat(api):` is fine but unnecessary for this size of repo).
- Don't commit generated files (`.claude/metadata/*.json` *is* committed — it's the index; but `.next/`, `test-results/`, `playwright-report/` are not).
- Don't commit with failing typecheck or unit tests.
- Don't skip hooks — fix the root cause instead.

## Branch naming

- Claude agent branches: `claude/<slug>` (already enforced for this workstream).
- Human feature branches: descriptive, e.g. `design-system-improvements`.
- Never push directly to `main`.
