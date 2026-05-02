"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";
import { useStreamingResponse } from "./useStreamingResponse";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function loadMessages(conversationId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(`aeon-messages-${conversationId}`);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveMessages(conversationId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(`aeon-messages-${conversationId}`, JSON.stringify(messages));
  } catch { /* quota exceeded */ }
}

const ACTIVE_KEY = "aeon-active-conv";

function getInitialConvId(externalId?: string): string {
  if (externalId) return externalId;
  // sessionStorage clears on tab close → always fresh session on reopen
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem(ACTIVE_KEY);
    if (saved) return saved;
  }
  return crypto.randomUUID();
}

/**
 * Main chat state management hook.
 * Persists messages to localStorage keyed by conversationId.
 * Accepts an optional external conversationId for loading saved conversations.
 */
export function useChat(externalConversationId?: string) {
  const [conversationId, setConversationId] = useState<string>(
    () => getInitialConvId(externalConversationId)
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => loadMessages(getInitialConvId(externalConversationId))
  );
  const [error, setError] = useState<string | null>(null);
  const { isStreaming, startStream, stopStream } = useStreamingResponse();
  const assistantIdRef = useRef<string>("");

  // When external conversationId changes (user selects a different convo), load its messages
  useEffect(() => {
    if (!externalConversationId) return;
    setConversationId(externalConversationId);
    setMessages(loadMessages(externalConversationId));
    setError(null);
    sessionStorage.setItem(ACTIVE_KEY, externalConversationId);
  }, [externalConversationId]);

  // Persist the active conversationId in sessionStorage (clears on tab close)
  useEffect(() => {
    sessionStorage.setItem(ACTIVE_KEY, conversationId);
  }, [conversationId]);

  // Persist messages whenever they change (skip empty & streaming states)
  useEffect(() => {
    if (messages.length === 0) return;
    // Don't save while the assistant is mid-stream (incomplete message)
    const hasActiveStream = messages.some((m) => m.isStreaming);
    if (!hasActiveStream) {
      saveMessages(conversationId, messages);
    }
  }, [messages, conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

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

      await startStream(
        content.trim(),
        conversationId,
        (token) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantIdRef.current
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantIdRef.current
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
        },
        (errorMsg) => {
          setError(errorMsg);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantIdRef.current
                ? { ...msg, content: "Lo siento, hubo un error al procesar tu mensaje.", isStreaming: false }
                : msg
            )
          );
        },
        (modelName, modelSpecialty) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantIdRef.current
                ? { ...msg, modelName, modelSpecialty }
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
    const newId = crypto.randomUUID();
    setConversationId(newId);
    sessionStorage.setItem(ACTIVE_KEY, newId);
    return newId;
  }, []);

  const editMessage = useCallback((id: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) => msg.id === id ? { ...msg, content: newContent } : msg)
    );
  }, []);

  return {
    messages,
    isStreaming,
    error,
    conversationId,
    sendMessage,
    stopStream,
    clearMessages,
    editMessage,
  };
}
