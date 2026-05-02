"use client";

import { useState, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/types";

/**
 * Hook para gestionar mensajes pineados por conversación.
 * Persiste en localStorage.
 */
export function usePinnedMessages(conversationId: string) {
  const storageKey = `aeon-pins-${conversationId}`;

  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(pinnedIds));
  }, [pinnedIds, storageKey]);

  const pinMessage = useCallback((id: string) => {
    setPinnedIds((prev) => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const unpinMessage = useCallback((id: string) => {
    setPinnedIds((prev) => prev.filter((p) => p !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const isPinned = useCallback((id: string) => pinnedIds.includes(id), [pinnedIds]);

  const getPinnedMessages = useCallback(
    (messages: ChatMessage[]) => messages.filter((m) => pinnedIds.includes(m.id)),
    [pinnedIds]
  );

  return { pinnedIds, pinMessage, unpinMessage, togglePin, isPinned, getPinnedMessages };
}
