/**
 * Aeon IA — Model Registry & Intelligent Router
 *
 * Arquitectura de 2 carriles:
 *
 * CARRIL VISUAL (Imágenes + Documentos):
 *   → SOLO modelos Gemma con visión. Sin fallback a otros modelos.
 *   → Gemma 4 31B (primario) → Gemma 3 27B (respaldo) → Gemma 4 26B (respaldo)
 *
 * CARRIL TEXTO (Chat, código, análisis, preguntas):
 *   → Router inteligente: OSS-120B / OSS-20B / Llama-70B según complejidad.
 *   → Gemma NO se usa para texto puro (se reserva para imágenes/docs).
 *
 * Modelos verificados FREE en OpenRouter (mayo 2026).
 */

export interface AIModel {
  id: string;
  name: string;
  specialty: string;
  description: string;
  strengths: string[];
  vision?: boolean;
}

/* ═══════════════════════════════════════════
 * CARRIL VISUAL — Solo Gemma (imágenes + documentos)
 * Estos modelos NUNCA se usan para texto puro.
 * ═══════════════════════════════════════════ */
export const VISION_MODELS: AIModel[] = [
  {
    id: "google/gemma-4-31b-it:free",
    name: "G4-31B",
    specialty: "Visión & Documentos",
    description: "Modelo visual principal. Analiza imágenes, PDFs, documentos y capturas.",
    vision: true,
    strengths: [
      "imagen", "foto", "analiza imagen", "describe imagen",
      "visual", "documento", "pdf", "archivo", "adjunto", "captura",
    ],
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "G3-27B",
    specialty: "Respaldo Visual",
    description: "Respaldo visual. Gemma 3 27B con soporte de imagen.",
    vision: true,
    strengths: [],
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "G4-26B",
    specialty: "Respaldo Visual Compacto",
    description: "Tercer respaldo visual. Gemma 4 26B compacto con visión.",
    vision: true,
    strengths: [],
  },
];

/* ═══════════════════════════════════════════
 * CARRIL TEXTO — Modelos para chat, código, análisis
 * Estos modelos NO reciben imágenes ni documentos.
 * ═══════════════════════════════════════════ */
export const TEXT_MODELS: AIModel[] = [
  {
    // El más potente (120B parámetros)
    id: "openai/gpt-oss-120b:free",
    name: "OSS-120B",
    specialty: "Razonamiento Avanzado & Análisis Profundo",
    description: "El más potente. 120B parámetros. Problemas complejos, código avanzado, redacción experta.",
    vision: false,
    strengths: [
      // Razonamiento complejo y multi-paso
      "analiza detalladamente", "análisis profundo", "razonamiento complejo",
      "explícame en profundidad", "dime todo sobre", "investigación completa",
      "compara y contrasta", "pro y contras", "ventajas y desventajas",
      "argumenta", "refuta", "evalúa críticamente", "demuéstrame",
      // Código avanzado y arquitectura
      "arquitectura", "diseño de sistema", "patrón de diseño", "refactorizar",
      "optimizar código", "algoritmo", "estructura de datos", "complejidad",
      "base de datos", "sql", "mongodb", "microservicio", "escalabilidad",
      "seguridad informática", "ciberseguridad", "penetration", "exploit",
      "machine learning", "inteligencia artificial", "modelo de datos",
      "typescript", "next.js", "node", "kubernetes", "infraestructura",
      // Escritura experta
      "escribe un ensayo", "redacta un informe", "elabora un documento",
      "escribe profesionalmente", "tesis", "investigación académica",
      "plan estratégico", "plan de negocios completo", "propuesta técnica",
      // Ciencia avanzada
      "ecuación diferencial", "cálculo integral", "álgebra lineal",
      "estadística avanzada", "probabilidad", "física cuántica",
      "termodinámica", "electromagnetismo", "mecánica clásica",
      // Filosofía
      "filosofía", "ética", "epistemología", "ontología",
      "dilema moral", "pensamiento crítico", "lógica formal",
    ],
  },
  {
    // Técnico / Profesional (20B)
    id: "openai/gpt-oss-20b:free",
    name: "OSS-20B",
    specialty: "Razonamiento Técnico",
    description: "Especialista en medicina, finanzas, derecho y razonamiento paso a paso.",
    vision: false,
    strengths: [
      // Medicina
      "medicina", "médico", "medico", "diagnóstico", "diagnostico",
      "síntoma", "sintoma", "tratamiento", "enfermedad", "salud",
      "clínica", "clinica", "hospital", "paciente", "dosis",
      // Finanzas
      "finanzas", "inversión", "inversion", "economía", "economia",
      "mercado", "contabilidad", "presupuesto", "impuesto", "renta",
      "bolsa", "acción", "accion", "bono", "rendimiento",
      // Legal
      "legal", "derecho", "ley", "contrato", "abogado",
      "demanda", "juicio", "norma", "reglamento",
      // Negocios
      "negocio", "empresa", "estrategia", "plan de negocio",
      "paso a paso", "detallado", "explica en detalle",
    ],
  },
  {
    // Respaldo general (70B)
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama-70B",
    specialty: "Respaldo General",
    description: "Fallback robusto para texto. Llama 70B instrucciones.",
    vision: false,
    strengths: [
      // Conversación general
      "hola", "qué tal", "cómo estás", "buenos días", "buenas tardes",
      "cuéntame", "ayuda", "general", "conversación", "charla",
      // Razonamiento
      "razonamiento", "analizar", "análisis", "lógica", "por qué",
      "explica", "debate", "comparar", "evaluar",
      // Contenido creativo
      "historia", "cultura", "opinión", "consejo", "creativo",
      "poema", "cuento", "idea", "recomienda",
      // Escritura
      "resume", "resumen", "traduce", "traducir", "escribe", "redacta",
      "carta", "email", "lista", "pasos", "guía", "tutorial",
      // Código general
      "código", "programar", "bug", "función", "api",
      "javascript", "python", "react", "docker", "backend", "frontend",
      // Ciencia
      "ciencia", "física", "matemáticas", "cálculo", "química",
      "investigación", "hipótesis", "teoría",
    ],
  },
];

/* ═══════════════════════════════════════════
 * ALL_MODELS — Para compatibilidad con código existente
 * ═══════════════════════════════════════════ */
export const AUTHORIZED_MODELS: AIModel[] = [...VISION_MODELS, ...TEXT_MODELS];

/* ═══════════════════════════════════════════
 * Intelligent Router — SOLO para texto
 *
 * NIVEL 3 — Máxima complejidad → OSS-120B
 * NIVEL 2 — Técnico/Profesional → OSS-20B
 * NIVEL 1 — General → Llama-70B
 *
 * Gemma NUNCA se selecciona para texto puro.
 * ═══════════════════════════════════════════ */
export function routeToModel(message: string): AIModel {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // ── NIVEL 3: OSS-120B — Tareas de máxima exigencia
  const powerKeywords = [
    "analiza detalladamente", "analisis profundo", "razonamiento complejo",
    "explicame en profundidad", "dime todo sobre", "investigacion completa",
    "compara y contrasta", "pro y contras", "ventajas y desventajas",
    "argumenta", "refuta", "evalua criticamente", "demuestrame",
    "arquitectura", "diseno de sistema", "patron de diseno", "refactorizar",
    "optimizar codigo", "algoritmo", "estructura de datos", "complejidad",
    "base de datos", "sql", "mongodb", "microservicio", "escalabilidad",
    "seguridad informatica", "ciberseguridad", "machine learning",
    "inteligencia artificial", "modelo de datos", "kubernetes", "infraestructura",
    "escribe un ensayo", "redacta un informe", "elabora un documento",
    "tesis", "investigacion academica", "plan estrategico", "propuesta tecnica",
    "ecuacion diferencial", "calculo integral", "algebra lineal",
    "estadistica avanzada", "fisica cuantica", "filosofia", "etica",
    "dilema moral", "pensamiento critico", "logica formal",
  ];

  for (const kw of powerKeywords) {
    if (lower.includes(kw)) {
      return TEXT_MODELS[0]; // OSS-120B
    }
  }

  // ── NIVEL 2: OSS-20B — Temas técnicos/profesionales
  const techKeywords = [
    "medicina", "medico", "diagnostico", "sintoma", "tratamiento",
    "enfermedad", "salud", "hospital", "clinica", "paciente",
    "finanzas", "inversion", "economia", "mercado", "contabilidad",
    "presupuesto", "impuesto", "bolsa", "bono", "rendimiento",
    "legal", "derecho", "ley", "contrato", "abogado",
    "negocio", "empresa", "estrategia", "plan de negocio",
    "paso a paso", "detallado", "explica en detalle",
  ];

  for (const kw of techKeywords) {
    if (lower.includes(kw)) {
      return TEXT_MODELS[1]; // OSS-20B
    }
  }

  return TEXT_MODELS[2]; // Llama-70B — general por defecto
}

/**
 * Obtiene un modelo por su ID exacto.
 */
export function getModelById(id: string): AIModel | undefined {
  return AUTHORIZED_MODELS.find((m) => m.id === id);
}
