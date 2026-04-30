/**
 * Sovereignty Layer — Data-sovereign AI connection manager.
 *
 * Provides a configurable connection layer that can route requests to:
 * - Local API (default, /api/chat)
 * - Self-hosted container endpoint (via NEXT_PUBLIC_AI_ENDPOINT)
 * - Private cloud infrastructure
 *
 * No data passes through third-party services unless explicitly configured.
 */

import type { ConnectionStatus, StreamEvent } from "@/types";
import { DEFAULT_AI_CONFIG, type AIConfig } from "./types";
import { parseSSEStream } from "./stream";

type StatusCallback = (status: ConnectionStatus) => void;

/**
 * Sovereign connection manager.
 * Manages the lifecycle of connections to self-hosted AI endpoints.
 */
export class SovereignConnection {
  private config: AIConfig;
  private abortController: AbortController | null = null;
  private statusListeners: Set<StatusCallback> = new Set();
  private _status: ConnectionStatus = "disconnected";

  constructor(config?: Partial<AIConfig>) {
    this.config = { ...DEFAULT_AI_CONFIG, ...config };
  }

  /** Current connection status */
  get status(): ConnectionStatus {
    return this._status;
  }

  /** Subscribe to status changes */
  onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private setStatus(status: ConnectionStatus) {
    this._status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  /**
   * Send a message and receive a streaming response.
   * Automatically retries on failure up to maxRetries.
   */
  async *sendMessage(
    message: string,
    conversationId?: string
  ): AsyncGenerator<StreamEvent, void, unknown> {
    this.abortController = new AbortController();
    let retries = 0;

    while (retries <= this.config.maxRetries) {
      try {
        this.setStatus("connecting");

        const response = await fetch(this.config.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, conversationId }),
          signal: this.abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.setStatus("connected");

        for await (const event of parseSSEStream(response)) {
          yield event;
          if (event.type === "error") {
            this.setStatus("error");
            return;
          }
        }

        this.setStatus("connected");
        return;
      } catch (error) {
        if (this.abortController.signal.aborted) {
          this.setStatus("disconnected");
          return;
        }

        retries++;
        if (retries > this.config.maxRetries) {
          this.setStatus("error");
          yield {
            type: "error",
            error:
              error instanceof Error
                ? error.message
                : "Connection failed after maximum retries",
          };
          return;
        }

        this.setStatus("reconnecting");
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.retryDelay * retries)
        );
      }
    }
  }

  /** Abort the current request */
  abort() {
    this.abortController?.abort();
    this.abortController = null;
    this.setStatus("disconnected");
  }

  /** Update the endpoint configuration */
  updateEndpoint(endpoint: string) {
    this.config.endpoint = endpoint;
  }
}

/** Singleton instance for the app */
let instance: SovereignConnection | null = null;

export function getSovereignConnection(
  config?: Partial<AIConfig>
): SovereignConnection {
  if (!instance) {
    instance = new SovereignConnection(config);
  }
  return instance;
}
