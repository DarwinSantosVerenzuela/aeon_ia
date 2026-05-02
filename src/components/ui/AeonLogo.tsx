/**
 * AeonLogo — Componente de identidad visual oficial de Aeon IA.
 *
 * Variantes:
 *   "symbol"   — solo el símbolo asterisco
 *   "wordmark" — símbolo + "aeon" en serif
 *   "full"     — símbolo + "aeon" + "IA" (subtítulo)
 *
 * Temas:
 *   "dark"  — grafito (#3d3d3d), ideal para fondos claros
 *   "light" — rosa pálido (#f2d6d6), ideal para fondos oscuros
 *   "white" — blanco puro
 */

"use client";

interface AeonLogoProps {
  variant?: "symbol" | "wordmark" | "full";
  theme?: "dark" | "light" | "white";
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// El símbolo es un asterisco de 8 rayos + punto superior (la "i")
// Construido como SVG vectorial puro fiel al logo original
function AeonSymbol({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Punto superior — la "i" sobre el asterisco */}
      <rect x="43" y="8" width="14" height="8" rx="4" fill={color} />

      {/* Barra vertical */}
      <rect x="43" y="20" width="14" height="60" rx="6" fill={color} />

      {/* Barra horizontal */}
      <rect x="14" y="43" width="72" height="14" rx="6" fill={color} />

      {/* Diagonal ↗ ↙ */}
      <rect
        x="43" y="20" width="14" height="60" rx="6"
        fill={color}
        transform="rotate(45 50 50)"
      />

      {/* Diagonal ↘ ↖ */}
      <rect
        x="43" y="20" width="14" height="60" rx="6"
        fill={color}
        transform="rotate(-45 50 50)"
      />
    </svg>
  );
}

export default function AeonLogo({
  variant = "wordmark",
  theme = "dark",
  size = 32,
  className,
  style,
}: AeonLogoProps) {
  const colorMap = {
    dark: "#3d3d3d",
    light: "#f2c4c4",
    white: "#ffffff",
  };

  const color = colorMap[theme];

  // Tamaño del símbolo según variante
  const symbolSize = variant === "full" ? size : size;
  // Tamaño de fuente proporcional al símbolo
  const fontSize = size * 0.85;

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.28,
        userSelect: "none",
        ...style,
      }}
    >
      <AeonSymbol color={color} size={symbolSize} />

      {(variant === "wordmark" || variant === "full") && (
        <span
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize,
            fontWeight: 400,
            color,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          aeon
        </span>
      )}

      {variant === "full" && (
        <span
          style={{
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: fontSize * 0.5,
            fontWeight: 300,
            color,
            letterSpacing: "0.1em",
            opacity: 0.55,
            alignSelf: "flex-end",
            paddingBottom: "0.15em",
          }}
        >
          IA
        </span>
      )}
    </div>
  );
}
