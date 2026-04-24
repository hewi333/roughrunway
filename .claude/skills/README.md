# Skills

This repo's user-facing agent skills live in the **top-level** `skills/` directory (not here), because they are also distributed via the MCP server and the public agent-architecture docs. Point your agents there:

| Skill | File | When |
|---|---|---|
| Create a RoughRunway model | `skills/create-runway-model/SKILL.md` | User describes their org; you construct a valid model and hand off via URL / import / paste. |
| Run a scenario | `skills/run-scenario/SKILL.md` | User wants a stress test ("what if ETH -60%?"). |
| Analyze a projection | `skills/analyze-projection/SKILL.md` | User wants the model interpreted — runway, risks, suggestions. |
| Import / export a model | `skills/import-export-model/SKILL.md` | User has JSON or a share link and wants to load/save it. |

This folder (`.claude/skills/`) is reserved for future **repo-maintenance** skills — things that help contributors *work on the codebase*, not *use the product*. None exist yet. Candidates, if you find yourself running the same multi-step ritual repeatedly:

- **release** — tag + changelog + `mcp/` republish checklist.
- **engine-migration** — changing `MonthlyProjection` or `RunwaySummary` shape safely.
- **perplexity-prompt-tune** — A/B a prompt change across `parse-setup` and `agent/build` (they share a prompt).

Don't create these speculatively. Add one when the pattern has recurred 2–3 times.

## Related

- `docs/07-AGENT-ARCHITECTURE.md` — how external agents call this app
- `mcp/src/index.ts` — MCP tool surface (wraps the same skills)
