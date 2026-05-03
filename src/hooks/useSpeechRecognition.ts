"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook para dictado por voz usando Web Speech API.
 * 
 * ARQUITECTURA ANTI-DUPLICACIÓN:
 * ─────────────────────────────
 * Usa modo SINGLE-SHOT (continuous=false) en lugar de continuous=true.
 * 
 * continuous=true es EXTREMADAMENTE BUGGY en Chrome móvil y Android:
 * - Dispara el mismo resultado final múltiples veces
 * - Causa "Hola Hola Hola cómo estás Hola cómo estás"
 * 
 * Con continuous=false:
 * - Cada sesión produce EXACTAMENTE 1 resultado final
 * - Auto-reinicio entre frases si el mic sigue activo
 * - IMPOSIBLE que haya duplicados
 */

// Tipado para SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  error: string | null;
}

export function useSpeechRecognition(
  onTranscript: (text: string) => void,
  lang: string = "es-ES"
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Refs — accesibles en event callbacks sin causar re-renders ni violar reglas de hooks
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const wantListeningRef = useRef(false);
  const lastTextRef = useRef("");
  const lastTextTimeRef = useRef(0);
  const processingRef = useRef(false);
  const langRef = useRef(lang);
  // Ref que almacena la función de lanzamiento — rompe auto-referencia
  const launchRef = useRef<() => void>(() => {});

  // Sincronizar refs con props actuales (en useEffect, NO durante render)
  useEffect(() => { onTranscriptRef.current = onTranscript; });
  useEffect(() => { langRef.current = lang; }, [lang]);

  const isSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;

  // Inicializar la función de lanzamiento en un useEffect (no durante render)
  useEffect(() => {
    launchRef.current = () => {
      const SpeechRecognitionClass = getSpeechRecognition();
      if (!SpeechRecognitionClass || !wantListeningRef.current) {
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = langRef.current;
      // ═══ CLAVE: continuous=false — modo single-shot ═══
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (processingRef.current) return;

        const result = event.results[0];
        if (!result) return;

        if (result.isFinal) {
          processingRef.current = true;
          const text = result[0].transcript.trim();

          if (text) {
            const now = Date.now();
            // ═══ DEDUPLICACIÓN: ignorar texto idéntico en menos de 2s ═══
            const isDuplicate =
              text === lastTextRef.current &&
              now - lastTextTimeRef.current < 2000;

            if (!isDuplicate) {
              lastTextRef.current = text;
              lastTextTimeRef.current = now;
              onTranscriptRef.current(text);
            }
          }
          setInterimTranscript("");
        } else {
          setInterimTranscript(result[0].transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "aborted" || event.error === "no-speech") return;
        if (event.error === "not-allowed") {
          setError("Permiso de micrófono denegado. Actívalo en la configuración del navegador.");
        } else {
          setError("Error de reconocimiento de voz.");
        }
        wantListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        processingRef.current = false;
        recognitionRef.current = null;

        // ═══ AUTO-REINICIO si el usuario quiere seguir escuchando ═══
        if (wantListeningRef.current) {
          setTimeout(() => {
            if (wantListeningRef.current) {
              launchRef.current();
            } else {
              setIsListening(false);
              setInterimTranscript("");
            }
          }, 150);
        } else {
          setIsListening(false);
          setInterimTranscript("");
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch {
        wantListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    // Cleanup on unmount
    return () => {
      wantListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!getSpeechRecognition()) {
      setError("Tu navegador no soporta dictado por voz. Usa Chrome o Edge.");
      return;
    }

    // Abortar cualquier instancia existente
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    setError(null);
    setInterimTranscript("");
    processingRef.current = false;
    wantListeningRef.current = true;

    launchRef.current();
  }, []);

  const stopListening = useCallback(() => {
    wantListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    error,
  };
}
