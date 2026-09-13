import { type NextRequest, NextResponse } from "next/server";
import { createRateLimiter, isSameOrigin } from "@/lib/sally-proxy-guard";

/**
 * Local LLM intent proxy (BYOK). Forwards OpenAI-compatible chat/completions.
 * Browser never holds OPENAI_API_KEY. Hosted runtime proxy stays commercial (D-29).
 */
const rateLimiter = createRateLimiter(30, 60_000);
const MAX_BODY_BYTES = 64 * 1024;

export async function GET() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ available: false }, { status: 503 });
  }
  return NextResponse.json({ available: true });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 },
    );
  }

  const host = request.headers.get("host") ?? "";
  const origin = request.headers.get("origin");
  if (!isSameOrigin(origin, host)) {
    return NextResponse.json({ error: "origin not allowed" }, { status: 403 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  if (!rateLimiter.allow(ip)) {
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "body too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (!Array.isArray(payload.messages) || !Array.isArray(payload.tools)) {
    return NextResponse.json(
      { error: "messages and tools required" },
      { status: 400 },
    );
  }

  const model =
    typeof payload.model === "string" && payload.model.trim()
      ? payload.model.trim()
      : (process.env.SALLY_INTENT_MODEL ?? "gpt-4o-mini");

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature:
        typeof payload.temperature === "number" ? payload.temperature : 0,
      tool_choice: payload.tool_choice ?? "required",
      tools: payload.tools,
      messages: payload.messages,
    }),
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
