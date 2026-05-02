"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type ReactionType = "up" | "down" | null;

const KEY = (convId: string) => `aeon-reactions-${convId}`;

/**
 * Persists per-message reactions (like/dislike) in localStorage.
 * Scoped to a conversation ID.
 * NUNCA se borran a menos que el usuario elimine la conversación completa.
 */
export function useReactions(conversationId: string) {
  const currentKey = KEY(conversationId);
  const prevKeyRef = useRef(currentKey);

  const [reactions, setReactions] = useState<Record<string, ReactionType>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(currentKey);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  // CRITICAL: When conversationId changes, RE-LOAD data from localStorage
  useEffect(() => {
    if (prevKeyRef.current === currentKey) return;
    prevKeyRef.current = currentKey;

    try {
      const stored = localStorage.getItem(currentKey);
      setReactions(stored ? JSON.parse(stored) : {});
    } catch {
      setReactions({});
    }
  }, [currentKey]);

  // Save to localStorage whenever reactions change
  useEffect(() => {
    if (prevKeyRef.current !== currentKey) return;
    localStorage.setItem(currentKey, JSON.stringify(reactions));
  }, [reactions, currentKey]);

  const setReaction = useCallback((messageId: string, reaction: ReactionType) => {
    setReactions((prev) => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction,
    }));
  }, []);

  const getReaction = useCallback(
    (messageId: string): ReactionType => reactions[messageId] ?? null,
    [reactions]
  );

  return { setReaction, getReaction, reactions };
}
