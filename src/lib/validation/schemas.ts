import { z } from "zod";

/**
 * Schema for validating chat message requests.
 * Enforces length limits and sanitization at the schema level.
 */
export const ChatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(50000, "Message exceeds limit")
    .trim(),
  conversationId: z
    .string()
    .uuid("Invalid conversation ID format")
    .optional(),
  /** File attachments with extracted content */
  attachments: z.array(z.object({
    name: z.string().max(255),
    type: z.enum(["pdf", "word", "image", "video", "text"]),
    /** Extracted text (for PDF, Word, text files) — max 200KB */
    textContent: z.string().max(200_000).optional(),
    /** Base64 data URL (for images) — max ~15MB imagen real = ~20MB base64 */
    imageData: z.string().max(20_000_000).optional(),
    /** Base64 data URL (for videos) — max ~20MB */
    videoData: z.string().max(20_000_000).optional(),
  })).max(5).optional(),
  /** Feedback memory context for continuous learning */
  feedbackContext: z.string().max(5000).optional(),
});

/** Inferred type from the chat message schema */
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

/**
 * Schema for validating environment configuration.
 */
export const EnvSchema = z.object({
  AI_ENDPOINT: z.string().url().optional(),
  RATE_LIMIT_MAX: z.coerce.number().positive().optional().default(20),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().optional().default(60000),
});
