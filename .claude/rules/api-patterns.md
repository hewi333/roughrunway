# API Patterns

Rules for `app/api/**/route.ts` files.

## Two route families

1. **`/api/ai/*`** — user-facing UI calls these. Usually POST-only, returns parsed JSON.
2. **`/api/agent/*`** — external agents (Claude, ChatGPT) call these. Support both GET (for URL-fetch tools) and POST (for function-calling tools). Return human-readable shareable artifacts.

## Canonical structure

```ts
import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import { SOME_SCHEMA } from "@/lib/json-schemas";

const MAX_INPUT_LENGTH = 2000; // always bound inputs

export async function POST(req: NextRequest) {
  // 1. Capability gate
  if (!process.env.PERPLEXITY_API_KEY) {
    return Response.json({ error: "AI features not configured" }, { status: 503 });
  }

  // 2. Parse body with safe fallback
  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 3. Bound + validate
  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_INPUT_LENGTH);
  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  // 4. Call AI with JSON-schema response format
  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar-pro", // or "sonar" for cheaper
      messages: [
        { role: "system", content: "…" },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "<snake_case_name>", schema: SOME_SCHEMA },
      } as Parameters<typeof perplexity.chat.completions.create>[0]["response_format"],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    return Response.json(JSON.parse(content));
  } catch (err) {
    console.error("[<route-name>]", err instanceof Error ? err.message : err);
    return Response.json({ error: "User-facing error message" }, { status: 400 });
  }
}
```

## Must-do list

- Put the JSON schema in `lib/json-schemas.ts`, not inline.
- Name the log prefix after the route: `console.error("[parse-setup]", ...)`.
- Return `503` for missing env vars. Never throw a 500 the user sees.
- Return user-friendly error messages (the UI surfaces them directly).
- Temperature `0.2` for structured parsing; higher only if generating creative text.
- For agent routes: expose GET *and* POST; GET reads from `req.nextUrl.searchParams`.

## Must-not-do list

- **Never** log the full request body (treasury data is sensitive).
- **Never** import from `components/` — routes are server-only.
- **Never** read files from disk at request time (Vercel edge runtime compat).
- **Never** write to localStorage / any client-only API.
- **Never** introduce hidden state — routes are stateless.

## AI prompt updates

The AI-setup flow exists in two places (legacy reasons):
- `app/api/ai/parse-setup/route.ts` — client-called.
- `app/api/agent/build/route.ts` — agent-called.

They share the same system prompt verbatim. **Update both together** or extract to `lib/` when you next touch this code.

## Common pitfalls

- Forgetting the `as Parameters<…>[0]["response_format"]` cast on `response_format` — the `openai` SDK types don't know about `json_schema`.
- Assuming `completion.choices[0].message.content` is present — it can be `null` when the model refuses; check for null and throw.
- Parsing JSON inside the try-block (so parse errors hit the single error handler).
- Returning raw error messages from Perplexity to the user — they leak internals. Always use a hand-written user-facing string.

## Related

- `.claude/entry/add-route.md` — quick start
- `docs/06-PERPLEXITY-INTEGRATION.md` — full integration notes
- `docs/07-AGENT-ARCHITECTURE.md` — external agent surface
