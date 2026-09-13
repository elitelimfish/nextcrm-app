import { type NextRequest, NextResponse } from "next/server";
import { createRateLimiter, isSameOrigin } from "@/lib/sally-proxy-guard";

/**
 * Local Grok live-voice ephemeral token (BYOK). Holds XAI_API_KEY server-side.
 * Hosted proxy stays D-29. Product voice is Grok Talk only — no Whisper.
 */
const rateLimiter = createRateLimiter(10, 60_000);

export async function GET() {
  if (!process.env.XAI_API_KEY) {
    return NextResponse.json({ available: false }, { status: 503 });
  }
  return NextResponse.json({ available: true });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "XAI_API_KEY not configured" },
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

  const upstream = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expires_after: { seconds: 300 } }),
  });

  if (!upstream.ok) {
    console.error(`[sally/voice-session] xAI ${upstream.status}`);
    return NextResponse.json(
      { error: "live token mint failed" },
      { status: upstream.status === 429 ? 429 : 502 },
    );
  }

  const data: unknown = await upstream.json();
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const secret = rec.client_secret;
  const value =
    typeof rec.value === "string"
      ? rec.value
      : typeof rec.token === "string"
        ? rec.token
        : secret && typeof secret === "object"
          ? (secret as { value?: unknown }).value
          : undefined;
  if (typeof value !== "string" || !value) {
    return NextResponse.json({ error: "live token mint failed" }, { status: 502 });
  }
  return NextResponse.json({ value });
}
