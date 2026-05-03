"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";

/**
 * Hook para gestionar mensajes pineados por conversación.
 * Persiste en localStorage — NUNCA se borran a menos que el usuario elimine la conversación.
 */
export function usePinnedMessages(conversationId: string) {
  const storageKey = `aeon-pins-${conversationId}`;
  const prevKeyRef = useRef(storageKey);

  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // CRITICAL: When conversationId changes, RE-LOAD data from localStorage
  // Without this, the old state would persist and overwrite the new conversation's data
   
  useEffect(() => {
    if (prevKeyRef.current === storageKey) return;
    prevKeyRef.current = storageKey;

    try {
      const stored = localStorage.getItem(storageKey);
      setPinnedIds(stored ? JSON.parse(stored) : []);
    } catch {
      setPinnedIds([]);
    }
  }, [storageKey]);

  // Save to localStorage whenever pinnedIds change
  // BUT only after the initial load for this key is complete
  useEffect(() => {
    // Only save if we're on the current key (not during a key transition)
    if (prevKeyRef.current !== storageKey) return;
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
