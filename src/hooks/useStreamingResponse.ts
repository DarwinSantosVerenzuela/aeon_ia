"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage, StreamEvent } from "@/types";
import { parseSSEStream } from "@/lib/ai/stream";

/**
 * Hook for consuming an SSE streaming response.
 * Manages the streaming lifecycle and accumulates tokens.
 */
export function useStreamingResponse() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (
      message: string,
      conversationId?: string,
      onToken?: (content: string) => void,
      onComplete?: (fullContent: string) => void,
      onError?: (error: string) => void,
      onModelInfo?: (modelName: string, modelSpecialty: string) => void
    ) => {
      setIsStreaming(true);
      setStreamedContent("");
      abortRef.current = new AbortController();

      let accumulated = "";
      let modelInfoSent = false;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, conversationId }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        for await (const event of parseSSEStream(response)) {
          if (event.type === "token") {
            // Capture model info from first event
            if (!modelInfoSent && event.model) {
              onModelInfo?.(event.model, event.specialty || "");
              modelInfoSent = true;
            }
            if (event.content) {
              accumulated += event.content;
              setStreamedContent(accumulated);
              onToken?.(event.content);
            }
          } else if (event.type === "error") {
            onError?.(event.error || "Stream error");
            break;
          } else if (event.type === "done") {
            break;
          }
        }

        onComplete?.(accumulated);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          onError?.(
            error instanceof Error ? error.message : "Stream failed"
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    []
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    streamedContent,
    startStream,
    stopStream,
  };
}
