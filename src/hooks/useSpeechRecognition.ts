"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook para dictado por voz usando Web Speech API.
 * 
 * ARQUITECTURA ANTI-DUPLICACIÓN:
 * ─────────────────────────────
 * Usa modo SINGLE-SHOT (continuous=false) en lugar de continuous=true.
 * 
 * ¿Por qué? continuous=true es EXTREMADAMENTE BUGGY en Chrome móvil y Android:
 * - Dispara el mismo resultado final múltiples veces
 * - Los índices (resultIndex) no avanzan correctamente
 * - Causa "Hola Hola Hola cómo estás Hola cómo estás" etc.
 * 
 * Con continuous=false:
 * - Cada sesión produce EXACTAMENTE 1 resultado final
 * - Después del resultado, se reinicia automáticamente si el usuario sigue con el mic activo
 * - IMPOSIBLE que haya duplicados porque cada sesión es independiente
 * 
 * Además tiene 2 capas extra de seguridad:
 * 1. Deduplicación por contenido+tiempo (ignora texto idéntico en <2s)
 * 2. Flag de procesamiento para evitar race conditions
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
  /** Whether browser supports speech recognition */
  isSupported: boolean;
  /** Whether currently listening */
  isListening: boolean;
  /** Interim transcript (live, not finalized) */
  interimTranscript: string;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Toggle listening on/off */
  toggleListening: () => void;
  /** Last error message, if any */
  error: string | null;
}

export function useSpeechRecognition(
  onTranscript: (text: string) => void,
  lang: string = "es-ES"
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  // ═══ ANTI-DUPLICACIÓN: estado de control ═══
  // Flag que indica si el USUARIO quiere seguir escuchando (mic activo)
  const wantListeningRef = useRef(false);
  // Último texto enviado + timestamp para deduplicación
  const lastTextRef = useRef("");
  const lastTextTimeRef = useRef(0);
  // Flag para evitar procesar resultados durante el reinicio
  const processingRef = useRef(false);

  useEffect(() => { onTranscriptRef.current = onTranscript; });

  const isSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;

  // Función interna que crea y configura una nueva instancia de reconocimiento
  const createRecognition = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return null;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang;
    // ═══ CLAVE: continuous=false — modo single-shot ═══
    // Cada sesión produce EXACTAMENTE 1 resultado final.
    // Esto ELIMINA por completo los duplicados de continuous=true.
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Prevenir procesamiento durante reinicio
      if (processingRef.current) return;

      // En modo single-shot, solo hay 1 resultado (índice 0)
      const result = event.results[0];
      if (!result) return;

      if (result.isFinal) {
        processingRef.current = true;
        const text = result[0].transcript.trim();

        if (text) {
          const now = Date.now();
          // ═══ DEDUPLICACIÓN: ignorar texto idéntico en menos de 2 segundos ═══
          const isDuplicate = text === lastTextRef.current && (now - lastTextTimeRef.current) < 2000;

          if (!isDuplicate) {
            lastTextRef.current = text;
            lastTextTimeRef.current = now;
            onTranscriptRef.current(text);
          }
        }

        setInterimTranscript("");
        // processingRef se resetea en onend
      } else {
        // Resultado intermedio — mostrar como preview
        setInterimTranscript(result[0].transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "aborted" y "no-speech" no son errores reales
      if (event.error === "aborted" || event.error === "no-speech") {
        // Si no-speech y el usuario quiere seguir, onend reiniciará
        return;
      }
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

      // ═══ AUTO-REINICIO: si el usuario quiere seguir escuchando ═══
      // Cada sesión single-shot termina después de 1 resultado final.
      // Si el mic sigue activo, creamos una nueva sesión limpia.
      if (wantListeningRef.current) {
        // Pequeño delay para evitar que Chrome rechace el start() inmediato
        setTimeout(() => {
          if (!wantListeningRef.current) {
            setIsListening(false);
            setInterimTranscript("");
            recognitionRef.current = null;
            return;
          }

          try {
            const newRecognition = createRecognition();
            if (newRecognition) {
              recognitionRef.current = newRecognition;
              newRecognition.start();
            } else {
              wantListeningRef.current = false;
              setIsListening(false);
            }
          } catch {
            wantListeningRef.current = false;
            setIsListening(false);
            setInterimTranscript("");
            recognitionRef.current = null;
          }
        }, 150);
      } else {
        // Usuario detuvo el mic — limpiar todo
        setIsListening(false);
        setInterimTranscript("");
        recognitionRef.current = null;
      }
    };

    return recognition;
  }, [lang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wantListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
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

    const recognition = createRecognition();
    if (!recognition) {
      setError("No se pudo iniciar el reconocimiento de voz.");
      wantListeningRef.current = false;
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError("No se pudo iniciar el reconocimiento de voz.");
      setIsListening(false);
      wantListeningRef.current = false;
      recognitionRef.current = null;
    }
  }, [createRecognition]);

  const stopListening = useCallback(() => {
    // Marcar que el usuario NO quiere seguir escuchando
    // Esto previene que onend reinicie la sesión
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
