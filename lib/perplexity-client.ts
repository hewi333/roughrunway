// Server-only — never import this from client components.
// The openai SDK is used as an OpenAI-compatible client pointed at Perplexity.
import OpenAI from "openai";

if (!process.env.PERPLEXITY_API_KEY) {
  console.warn("[perplexity] PERPLEXITY_API_KEY is not set — AI features will be disabled.");
}

export const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY ?? "missing",
  baseURL: "https://api.perplexity.ai",
});
