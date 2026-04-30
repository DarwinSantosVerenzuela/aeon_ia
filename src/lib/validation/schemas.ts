import { z } from "zod";

/**
 * Schema for validating chat message requests.
 * Enforces length limits and sanitization at the schema level.
 */
export const ChatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message exceeds 4000 character limit")
    .trim(),
  conversationId: z
    .string()
    .uuid("Invalid conversation ID format")
    .optional(),
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
