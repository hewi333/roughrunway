import { NextRequest } from "next/server";
import { perplexity } from "@/lib/perplexity-client";
import { TREASURY_EDIT_SCHEMA, BURN_EDIT_SCHEMA } from "@/lib/json-schemas";

const MAX_PROMPT_LENGTH = 1500;

type Scope = "treasury" | "burn";

function buildTreasuryPrompt(current: Record<string, unknown>): string {
  const stables = Array.isArray(current.stablecoins) ? (current.stablecoins as any[]) : [];
  const fiat = Array.isArray(current.fiat) ? (current.fiat as any[]) : [];
  const volatiles = Array.isArray(current.volatileAssets) ? (current.volatileAssets as any[]) : [];

  const stablesCtx =
    stables.map((s) => `  - ${s.name} (id: ${s.id}): $${s.amount}`).join("\n") || "  (none)";
  const fiatCtx =
    fiat.map((f) => `  - ${f.currency} (id: ${f.id}): ${f.amount}`).join("\n") || "  (none)";
  const volatilesCtx =
    volatiles
      .map(
        (v) =>
          `  - ${v.name} ${v.ticker} (id: ${v.id}, tier: ${v.tier}): ${v.quantity} @ $${v.currentPrice}`
      )
      .join("\n") || "  (none)";

  return `You are a treasury editor for a crypto runway modeling tool.

The user will describe a change to their treasury in natural language. Return the COMPLETE desired state of the treasury after applying the change. Preserve the id of any item you keep. Omit id for new items (one will be generated).

RULES:
- Do not drop items the user did not ask to change — return them unchanged with their original id.
- "Add 100k USDC" → keep existing stablecoins, add a new USDC entry (no id).
- "Change ETH quantity to 50" → return all assets, with ETH (matching id) having quantity 50.
- "Remove ACME" → return all OTHER assets unchanged; omit ACME from the response.
- BTC/ETH → tier "major", haircutPercent 2, liquidationPriority 10.
- Other named crypto → tier "alt", haircutPercent 10, liquidationPriority 30.
- "Our token" / "protocol token" → tier "native", haircutPercent 15, liquidationPriority 50.
- Ticker should be the uppercase symbol (BTC, ETH, USDC, etc.).
- If the user didn't give a price for a new volatile asset, set currentPrice to 0.
- Summary: 1-2 sentences explaining what changed.

CURRENT TREASURY:
Stablecoins:
${stablesCtx}

Fiat:
${fiatCtx}

Volatile assets:
${volatilesCtx}`;
}

function buildBurnPrompt(current: Record<string, unknown>): string {
  const cats = Array.isArray(current.burnCategories) ? (current.burnCategories as any[]) : [];
  const ctx =
    cats
      .map(
        (c) =>
          `  - ${c.name} (id: ${c.id}, presetKey: ${c.presetKey ?? "custom"}, monthly: $${c.monthlyBaseline}, active: ${c.isActive ?? true})`
      )
      .join("\n") || "  (none)";

  return `You are a burn-rate editor for a crypto runway modeling tool.

The user will describe a change to their monthly burn in natural language. Return the COMPLETE desired state of burnCategories after applying the change. Preserve id for items you keep. Omit id for new items.

RULES:
- Do not drop categories the user did not ask to change — return them unchanged with their original id.
- "Cut marketing 30%" → return all categories, with Marketing at monthlyBaseline * 0.7.
- "Add $20k/mo legal" → keep existing, add a new category (no id) name: "Legal", presetKey: "legal", monthlyBaseline: 20000.
- "Hire 2 engineers at 15k each" → keep existing, increase headcount category by 30000.
- "Remove Office" → return everything except Office.
- Preset keys: headcount, infrastructure, legal, marketing, office_admin, other. Use these when the name matches.
- Summary: 1-2 sentences explaining what changed.

CURRENT BURN CATEGORIES:
${ctx}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return Response.json({ error: "AI features not configured" }, { status: 503 });
  }

  let body: { prompt?: string; scope?: string; current?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_LENGTH);
  if (!prompt) {
    return Response.json({ error: "prompt is required" }, { status: 400 });
  }

  const scope = body.scope as Scope;
  if (scope !== "treasury" && scope !== "burn") {
    return Response.json({ error: "scope must be 'treasury' or 'burn'" }, { status: 400 });
  }

  const current = body.current ?? {};
  const systemPrompt =
    scope === "treasury" ? buildTreasuryPrompt(current) : buildBurnPrompt(current);
  const schema = scope === "treasury" ? TREASURY_EDIT_SCHEMA : BURN_EDIT_SCHEMA;

  try {
    const completion = await perplexity.chat.completions.create({
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: `${scope}_edit`, schema },
      } as Parameters<typeof perplexity.chat.completions.create>[0]["response_format"],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    if (!parsed.patch || !parsed.summary) throw new Error("Missing required fields");

    return Response.json(parsed);
  } catch (err) {
    console.error("[parse-edit]", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Could not parse that. Try rephrasing." },
      { status: 400 }
    );
  }
}
