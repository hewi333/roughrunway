# Entry: Add an API Route

## Quick Navigation

| Route kind | Template | Notes |
|---|---|---|
| Perplexity-backed AI | `app/api/ai/parse-setup/route.ts` | Pure POST. Validates input, calls Perplexity with JSON schema. |
| External agent (stateless) | `app/api/agent/encode/route.ts` | GET + POST. No AI. |
| External agent (AI) | `app/api/agent/build/route.ts` | GET + POST. Wraps AI + returns shareable URL. |
| Market data | `app/api/ai/market-banner/route.ts` | Caching, rate-limited. |

## Workflow

1. Create `app/api/<group>/<name>/route.ts`. Export `POST` and/or `GET` from it.
2. Read `.claude/rules/api-patterns.md` for required error handling, input bounding, and the 503 pattern.
3. If using AI: put the JSON schema in `lib/json-schemas.ts`. Use `perplexity` from `lib/perplexity-client.ts`.
4. If it returns a shareable model: use `exportModel()` from `lib/model-export.ts`.
5. Test: `curl -X POST localhost:3000/api/<group>/<name> -d '{...}' -H content-type:application/json`.
6. Add a row to `CLAUDE.md` Task Routing if this is a new route class.
7. Run `npm run meta:generate` to refresh `.claude/metadata/routes.json`.

## Canonical skeleton

```ts
import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import { SOME_SCHEMA } from "@/lib/json-schemas";

const MAX_INPUT = 2000;

export async function POST(req: NextRequest) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return Response.json({ error: "AI features not configured" }, { status: 503 });
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_INPUT);
  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar-pro",
      messages: [
        { role: "system", content: "…" },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "<name>", schema: SOME_SCHEMA },
      } as Parameters<typeof perplexity.chat.completions.create>[0]["response_format"],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");
    return Response.json(JSON.parse(content));
  } catch (err) {
    console.error("[<route-name>]", err instanceof Error ? err.message : err);
    return Response.json({ error: "…user-facing…" }, { status: 400 });
  }
}
```

## Don't Forget

- **Always** bound input length with a `MAX_*` constant.
- **Always** return `503` when `PERPLEXITY_API_KEY` is missing — never crash.
- **Never** log full request bodies (they may contain treasury data).
- **Never** import from `components/` into a route — routes are server-only.
- Agent routes that an LLM calls via URL fetch need a `GET` variant (see `agent/build`).

## Deeper Docs

- `.claude/rules/api-patterns.md`
- `docs/06-PERPLEXITY-INTEGRATION.md`
- `docs/07-AGENT-ARCHITECTURE.md`
