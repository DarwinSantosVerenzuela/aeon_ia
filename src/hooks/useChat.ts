"use client";

import { useState, useCallback, useRef } from "react";
import type { ChatMessage } from "@/types";
import { useStreamingResponse } from "./useStreamingResponse";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Main chat state management hook.
 * Manages messages, streaming, and conversation lifecycle.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId] = useState<string>(crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const { isStreaming, startStream, stopStream } = useStreamingResponse();
  const assistantIdRef = useRef<string>("");

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      // Add user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      // Add placeholder assistant message
      const assistantId = generateId();
      assistantIdRef.current = assistantId;

      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Start streaming
      await startStream(
        content.trim(),
        conversationId,
        // onToken — update assistant message content in real-time
        (token) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantIdRef.current
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        // onComplete — mark streaming as done
        () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantIdRef.current
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        },
        // onError
        (errorMsg) => {
          setError(errorMsg);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantIdRef.current
                ? {
                    ...msg,
                    content: "Lo siento, hubo un error al procesar tu mensaje.",
                    isStreaming: false,
                  }
                : msg
            )
          );
        }
      );
    },
    [isStreaming, conversationId, startStream]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    conversationId,
    sendMessage,
    stopStream,
    clearMessages,
  };
}
