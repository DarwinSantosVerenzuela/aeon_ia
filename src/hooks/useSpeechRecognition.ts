"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook para dictado por voz usando Web Speech API.
 * Transcribe la voz del usuario a texto en tiempo real.
 *
 * Soporte: Chrome, Edge, Safari 14.1+, Android WebView.
 * Firefox NO soporta SpeechRecognition — se deshabilita automáticamente.
 */

// Tipado para SpeechRecognition (no todas las builds de TS lo incluyen)
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
  onTranscriptRef.current = onTranscript;

  const isSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
    }

    setError(null);
    setInterimTranscript("");

    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);

      // Send finalized text immediately
      if (final) {
        onTranscriptRef.current(final);
        setInterimTranscript("");
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "aborted" and "no-speech" are not real errors
      if (event.error === "aborted" || event.error === "no-speech") {
        setIsListening(false);
        return;
      }
      if (event.error === "not-allowed") {
        setError("Permiso de micrófono denegado. Actívalo en la configuración del navegador.");
      } else {
        setError(`Error de reconocimiento: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError("No se pudo iniciar el reconocimiento de voz.");
      setIsListening(false);
    }
  }, [lang]);

  const stopListening = useCallback(() => {
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
