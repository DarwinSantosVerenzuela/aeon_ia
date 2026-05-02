/**
 * AeonLogo — Componente de identidad visual oficial de Aeon IA.
 *
 * USA LAS IMÁGENES REALES proporcionadas por el diseñador.
 * PROHIBIDO inventar, generar o deformar logos. Solo se usan los archivos reales.
 *
 * Archivos en /public/brand/:
 *   wordmark-dark.png   → 803×237 — fondo claro → logo oscuro
 *   wordmark-light.png  → 825×252 — fondo oscuro → logo claro
 *   symbol-dark.png     → 626×626 — símbolo solo, oscuro
 *   symbol-light.png    → 626×626 — símbolo solo, claro
 *
 * REGLA DE CONTRASTE:
 *   Fondo claro (#f5f5f7, blanco) → theme="dark"
 *   Fondo oscuro (#1a1a1a, negro) → theme="light"
 */

"use client";

import Image from "next/image";

interface AeonLogoProps {
  variant?: "symbol" | "wordmark";
  theme?: "dark" | "light";
  /** Altura en px */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Dimensiones reales de los archivos (no inventadas)
const DIMS: Record<string, { w: number; h: number }> = {
  "wordmark-dark":  { w: 803, h: 237 },
  "wordmark-light": { w: 825, h: 252 },
  "symbol-dark":    { w: 626, h: 626 },
  "symbol-light":   { w: 626, h: 626 },
};

const LOGO_SRC: Record<string, string> = {
  "symbol-dark":    "/brand/symbol-dark.png",
  "symbol-light":   "/brand/symbol-light.png",
  "wordmark-dark":  "/brand/wordmark-dark.png",
  "wordmark-light": "/brand/wordmark-light.png",
};

export default function AeonLogo({
  variant = "wordmark",
  theme = "dark",
  height = 32,
  className,
  style,
}: AeonLogoProps) {
  const key = `${variant}-${theme}`;
  const src = LOGO_SRC[key];
  const dims = DIMS[key];
  const width = Math.round(height * (dims.w / dims.h));

  return (
    <Image
      src={src}
      alt="Aeon IA"
      width={dims.w}
      height={dims.h}
      className={className}
      style={{
        width,
        height,
        objectFit: "contain",
        userSelect: "none",
        pointerEvents: "none",
        display: "block",
        ...style,
      }}
      priority
      draggable={false}
    />
  );
}
