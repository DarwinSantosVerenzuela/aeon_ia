/** Configuration for the AI connection layer */
export interface AIConfig {
  /** Base URL for the AI API endpoint */
  endpoint: string;
  /** Connection protocol preference */
  protocol: "sse" | "websocket" | "auto";
  /** Request timeout in milliseconds */
  timeout: number;
  /** Maximum retries before giving up */
  maxRetries: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
}

/** Default configuration — can be overridden via environment variables */
export const DEFAULT_AI_CONFIG: AIConfig = {
  endpoint: process.env.NEXT_PUBLIC_AI_ENDPOINT || "/api/chat",
  protocol: "sse",
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
};

/** SSE event data structure */
export interface SSEEvent {
  event?: string;
  data: string;
  id?: string;
  retry?: number;
}
