import { NextRequest, NextResponse } from "next/server";
import { ChatMessageSchema } from "@/lib/validation/schemas";
import { validateAndSanitize } from "@/lib/security/sanitize";
import { checkRateLimit, getClientIP } from "@/lib/security/rate-limit";
import { createSSEStream, demoStreamGenerator } from "@/lib/ai/stream";

/**
 * POST /api/chat
 * Streaming chat endpoint with full validation, sanitization, and rate limiting.
 * Currently runs in demo mode — will be connected to a containerized AI backend.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 2. Content-Type validation
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    // 3. Parse and validate request body with Zod
    const body = await request.json();
    const validation = ChatMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 4. Sanitize input
    const sanitizedMessage = validateAndSanitize(validation.data.message);

    // 5. Create streaming response
    // DEMO MODE: uses demoStreamGenerator
    // PRODUCTION: replace with actual AI backend call using sovereignty layer
    const stream = createSSEStream(() => demoStreamGenerator());

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Content-Type-Options": "nosniff",
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("[API/Chat] Error:", error);

    if (error instanceof Error && error.message.includes("dangerous")) {
      return NextResponse.json(
        { error: "Input rejected for security reasons" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Block non-POST methods */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
