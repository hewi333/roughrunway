# PR Conventions

The repo has a consistent PR flow — copy what existing PRs do.

## Title

Match the Conventional Commits format of the main commit, e.g.:

- `feat: /api/agent/encode — instant shareUrl with zero latency for AI agents`
- `fix: exclude mcp/ from Next.js tsconfig to prevent build failure`

Keep under 70 chars. Detail goes in the body.

## Body template

```markdown
## Summary
- One-line intent: what changed and why.
- Link the underlying spec / docs / issue if applicable.
- Call out any behavior change users will notice.

## Test plan
- [ ] `npm run typecheck`
- [ ] `npm run test:unit`
- [ ] `npm run test:e2e` (for UI changes)
- [ ] Manual: `npm run dev` → reproduce fix / feature
- [ ] (engine changes) `npm run verify:engine`
```

## CI

GitHub Actions at `.github/workflows/ci.yml` runs on every PR to `main`:
1. Install deps
2. `playwright install --with-deps`
3. `npm run typecheck`
4. `npm run test:unit`
5. `npm run test:e2e`
6. `npm run build`

**Don't** add new CI jobs here lightly — discuss first. Duplicate jobs exist in `ci-cd.yml`; don't add a third.

## Review expectations

- Self-review the diff before requesting review.
- Large refactors should be split — one PR for the move, one for the behavior change.
- Engine changes need a test delta; reviewers will ask for one.

## Do not

- **Do not** create a PR unless the user asks for one.
- **Do not** merge into `main` without review.
- **Do not** squash with a different commit message than the title (breaks changelog tooling).
- **Do not** include unrelated formatting changes.

## Related

- `.github/workflows/ci.yml` — what CI runs
- `.claude/rules/commit-conventions.md`
- `.claude/rules/workflows.md` — end-to-end dev cycle
