import { NextRequest, NextResponse } from "next/server";
import { ChatMessageSchema } from "@/lib/validation/schemas";
import { validateAndSanitize } from "@/lib/security/sanitize";
import { checkRateLimit, getClientIP } from "@/lib/security/rate-limit";
import {
  createSSEStream,
  demoStreamGenerator,
  ollamaStreamGenerator,
  openRouterStreamGenerator,
} from "@/lib/ai/stream";

/**
 * Resolve which AI provider to use.
 * Priority: AI_PROVIDER env → auto-detect → demo fallback.
 */
function getAIProvider(): "openrouter" | "ollama" | "demo" {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "openrouter" || explicit === "ollama" || explicit === "demo") {
    return explicit;
  }
  // Auto-detect: prefer OpenRouter if key exists, then Ollama, then demo
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.OLLAMA_BASE_URL) return "ollama";
  return "demo";
}

/**
 * POST /api/chat
 * Streaming chat endpoint with full validation, sanitization, and rate limiting.
 * Supports: OpenRouter (cloud), Ollama (self-hosted), Demo (testing).
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

    // 3. Body size limit (10MB max to prevent DoS)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    // 4. Parse and validate request body with Zod
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
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

    // 5. Sanitize input
    const sanitizedMessage = validateAndSanitize(validation.data.message);
    const attachments = validation.data.attachments;
    const feedbackContext = validation.data.feedbackContext;

    // 6. Select AI provider and create streaming response
    const provider = getAIProvider();

    const stream = createSSEStream(() => {
      switch (provider) {
        case "openrouter":
          return openRouterStreamGenerator(sanitizedMessage, attachments, feedbackContext);
        case "ollama":
          return ollamaStreamGenerator(sanitizedMessage);
        default:
          return demoStreamGenerator();
      }
    });

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
