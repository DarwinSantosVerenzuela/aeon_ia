/**
 * Server-Sent Events streaming utilities.
 * Handles both server-side encoding and client-side decoding of SSE streams.
 */

import type { StreamEvent } from "@/types";

/**
 * Create a ReadableStream that emits SSE-formatted data.
 * Used in API route handlers to stream responses.
 */
export function createSSEStream(
  generator: () => AsyncGenerator<StreamEvent, void, unknown>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator()) {
          const data = JSON.stringify(event);
          controller.enqueue(
            encoder.encode(`data: ${data}\n\n`)
          );
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: errorMsg })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Parse an SSE stream on the client side.
 * Yields StreamEvent objects as they arrive.
 */
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<StreamEvent, void, unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is not readable");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const data = JSON.parse(trimmed.slice(6)) as StreamEvent;
          yield data;

          if (data.type === "done" || data.type === "error") {
            return;
          }
        } catch {
          // Skip malformed SSE data
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Demo streaming generator.
 * Simulates AI response word-by-word for testing without a backend.
 */
export async function* demoStreamGenerator(): AsyncGenerator<
  StreamEvent,
  void,
  unknown
> {
  const responses = [
    "Hola, soy Aeon IA. Estoy aquí para asistirte con cualquier consulta que tengas.",
    "Actualmente estoy en modo de demostración. Cuando se conecte el backend de IA, podré proporcionar respuestas inteligentes y contextuales.",
    "Mi arquitectura está diseñada con seguridad soberana, lo que significa que tus datos permanecen bajo tu control total.",
    "Puedo ayudarte con análisis, generación de contenido, resolución de problemas técnicos y mucho más.",
    "¿En qué puedo ayudarte hoy? Estoy listo para procesar tu solicitud.",
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];
  const words = response.split(" ");

  for (const word of words) {
    yield { type: "token", content: word + " " };
    // Simulate natural typing speed
    await new Promise((resolve) =>
      setTimeout(resolve, 40 + Math.random() * 60)
    );
  }
}
