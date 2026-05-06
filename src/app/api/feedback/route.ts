import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/feedback
 * Secure feedback endpoint for the demo mode.
 *
 * SECURITY:
 * - Input is text-only, heavily sanitized
 * - Email destination is NEVER exposed to the client
 * - Rate limited: 1 submission per 60 seconds per IP
 * - All HTML/script tags stripped
 * - Max lengths enforced
 * - Logged to server console (visible in Docker logs)
 */

// ── Rate limiting store (in-memory, resets on restart — fine for demo) ──
const feedbackRateMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 per minute

// ── Destination (SERVER-ONLY — never sent to client) ──
const FEEDBACK_EMAIL = "mensajes@knowtech.cc";

// ── Sanitize text: strip ALL HTML, scripts, control chars ──
function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    // Remove HTML tags completely
    .replace(/<[^>]*>/g, "")
    // Remove script-like patterns
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:/gi, "")
    // Remove control characters (except newline, tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse excessive whitespace
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/ {3,}/g, "  ")
    .trim();
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    // ── Rate limiting ──
    const lastSubmission = feedbackRateMap.get(clientIP) || 0;
    if (Date.now() - lastSubmission < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait." },
        { status: 429 }
      );
    }

    // ── Parse body ──
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 415 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // ── Validate rating ──
    const rating = Number(body.rating);
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // ── Validate and sanitize comment ──
    const rawComment = String(body.comment || "").slice(0, 1000);
    const comment = sanitizeText(rawComment);

    // ── Validate timestamp (anti-replay: must be within last 5 minutes) ──
    const timestamp = Number(body._t);
    if (!timestamp || Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // ── Mark rate limit ──
    feedbackRateMap.set(clientIP, Date.now());

    // ── Log feedback to server (visible in Docker logs) ──
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    console.log(`\n═══════════════════════════════════════`);
    console.log(`[FEEDBACK] ${new Date().toISOString()}`);
    console.log(`  Rating:  ${stars} (${rating}/5)`);
    console.log(`  Comment: ${comment || "(sin comentario)"}`);
    console.log(`  IP:      ${clientIP}`);
    console.log(`  Target:  ${FEEDBACK_EMAIL}`);
    console.log(`═══════════════════════════════════════\n`);

    // ── Email delivery ──
    // To enable email: set SMTP_HOST, SMTP_USER, SMTP_PASS in .env
    // Then install nodemailer: npm i nodemailer @types/nodemailer
    // Feedback is ALWAYS logged to server console (Docker logs) regardless
    console.log(`[FEEDBACK] ℹ️ Feedback registrado — ver Docker logs para detalle`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** Block non-POST methods */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
