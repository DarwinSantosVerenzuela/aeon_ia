// Aeon IA — favicon SVG oficial
// Símbolo asterisco de 8 rayos + punto "i"
// Colores: grafito #3d3d3d sobre blanco

export default function AeonFaviconSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="5" fill="#ffffff"/>
      {/* Punto superior i */}
      <rect x="14.5" y="3.5" width="3" height="2" rx="0.9" fill="#3d3d3d"/>
      {/* Barra vertical */}
      <rect x="14.5" y="6.5" width="3" height="19" rx="1.3" fill="#3d3d3d"/>
      {/* Barra horizontal */}
      <rect x="6.5" y="14.5" width="19" height="3" rx="1.3" fill="#3d3d3d"/>
      {/* Diagonal +45 */}
      <g transform="rotate(45 16 16)">
        <rect x="14.5" y="6.5" width="3" height="19" rx="1.3" fill="#3d3d3d"/>
      </g>
      {/* Diagonal -45 */}
      <g transform="rotate(-45 16 16)">
        <rect x="14.5" y="6.5" width="3" height="19" rx="1.3" fill="#3d3d3d"/>
      </g>
    </svg>
  );
}
