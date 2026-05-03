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

// ID estable para evitar hydration mismatch — se reemplaza en useEffect
const SSR_PLACEHOLDER_ID = "ssr-placeholder";

/**
 * Main chat state management hook.
 * Persists messages to localStorage keyed by conversationId.
 * Accepts an optional external conversationId for loading saved conversations.
 * 
 * Usa un placeholder durante SSR para evitar hydration mismatch (React #418),
 * y sincroniza con sessionStorage en el primer useEffect del cliente.
 */
export function useChat(externalConversationId?: string) {
  const [conversationId, setConversationId] = useState<string>(
    externalConversationId || SSR_PLACEHOLDER_ID
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isStreaming, startStream, stopStream } = useStreamingResponse();
  const assistantIdRef = useRef<string>("");
  const initializedRef = useRef(false);

  // Hydrate on client mount — load real conversationId and messages from storage
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let id = externalConversationId;
    if (!id) {
      const saved = sessionStorage.getItem(ACTIVE_KEY);
      id = saved || crypto.randomUUID();
    }
    setConversationId(id);
    setMessages(loadMessages(id));
    sessionStorage.setItem(ACTIVE_KEY, id);
  }, [externalConversationId]);

  // When external conversationId changes (user selects a different convo), load its messages
  useEffect(() => {
    if (!externalConversationId || !initializedRef.current) return;
    setConversationId(externalConversationId);
    setMessages(loadMessages(externalConversationId));
    setError(null);
    sessionStorage.setItem(ACTIVE_KEY, externalConversationId);
  }, [externalConversationId]);

  // Persist the active conversationId in sessionStorage
  useEffect(() => {
    if (conversationId === SSR_PLACEHOLDER_ID) return;
    sessionStorage.setItem(ACTIVE_KEY, conversationId);
  }, [conversationId]);

  // Persist messages whenever they change (skip empty & streaming states)
  useEffect(() => {
    if (messages.length === 0) return;
    if (conversationId === SSR_PLACEHOLDER_ID) return;
    // Don't save while the assistant is mid-stream (incomplete message)
    const hasActiveStream = messages.some((m) => m.isStreaming);
    if (!hasActiveStream) {
      saveMessages(conversationId, messages);
    }
  }, [messages, conversationId]);

  const sendMessage = useCallback(
    async (content: string, attachments?: { name: string; type: "pdf" | "word" | "image" | "text"; textContent?: string; imageData?: string; size: number; previewUrl?: string }[], feedbackContext?: string) => {
      if (!content.trim() || isStreaming || conversationId === SSR_PLACEHOLDER_ID) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
        // Store lightweight attachment metadata for display (no base64)
        attachments: attachments?.map((a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
          previewUrl: a.type === "image" ? a.previewUrl : undefined,
        })),
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

      // Build API attachments (with content for the AI)
      const apiAttachments = attachments?.map((a) => ({
        name: a.name,
        type: a.type,
        textContent: a.textContent,
        imageData: a.imageData,
      }));

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
        },
        apiAttachments,
        feedbackContext
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
